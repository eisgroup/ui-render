/**
 * WHAT AN EDIT COSTS IN A BROWSER, on the published package (2026-10-12).
 * =============================================================================================
 *
 * The jsdom contracts (`src/library/__tests__/*-budget.test.js`) count renders; this measures time, in Chromium, on
 * the packed tarball a host installs. For each document of scripts/fixtures/packed-perf-entry.js it takes the main
 * thread's busy time, the DevTools protocol's `TaskDuration`, over the mount and over each action, an action being
 * what a user does and everything it sets off until the page is idle again (the 300 ms typing debounce included).
 * Each action runs five times, and the median is what counts. After its runs, an edit or a pick checks that its field
 * shows the last run's value, so that an action that stops changing anything fails instead of measuring nothing. A tab
 * switch waits for the table's field to be there, and a switch back for it to be gone. Each test writes its
 * document's numbers to PERF_OUT before it checks them, so that a document over its ceilings still reports, and so do
 * the ones after it. scripts/test-packed-perf.js runs it (`npm run test:perf`) and prints them; CI runs it in the
 * advisory `browser-perf` job, which reports and never blocks.
 *
 * Each ceiling below is two and a half to three times what GitHub's runner measured for the code it was set with, and
 * at least 100 ms for an action, so that a slower run passes and so does an action's own noise. The runner took about
 * three times as long as an Apple M4 to mount a document (2026-10-13), and the M4 measured one build about twice as
 * long one day as the next, so the ceilings follow the runner's numbers, which the `browser-perf` job prints. The tab
 * switch's were set from the M4's at that ratio, before the runner had measured them.
 *
 * A ceiling flags a cascade the size of the one #209 to #213 removed from the period table, whose edit cost five
 * times what it costs now. It does not flag a smaller one: the jsdom contracts, which count renders and field states,
 * guard those. Lower a ceiling when a number falls for good.
 */
const fs = require('fs')
const { test, expect } = require('@playwright/test')

const PAGE = process.env.PERF_PAGE
const REPEAT = 5
const results = {}

/** Milliseconds of main-thread work, per action, that no current scenario should come near. */
const CEILINGS = {
    periods: { mount: 2000, edit: 210, blur: 130 },
    selectTable: { mount: 820, edit: 100, blur: 100 },
    selectForm: { mount: 340, pick: 100, edit: 100 },
    numberTable: { mount: 780, edit: 100 },
    tabs: { mount: 330, switch: 720, back: 360 },
}

const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

/** Waits out the typing debounce and what it sets off, then a frame. */
async function settle (page) {
    await page.waitForTimeout(400)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0))))
}

/** Opens a scenario, and returns a function measuring an action's busy time in milliseconds, and the mount's. */
async function open (page, scenario) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Performance.enable')
    const busySoFar = async () => (await cdp.send('Performance.getMetrics')).metrics.find(metric => metric.name === 'TaskDuration').value
    await page.goto(`${PAGE}?scenario=${scenario}`)
    await expect(page.locator('body')).toHaveAttribute('data-scenario', scenario)
    await settle(page)
    const mount = Math.round((await busySoFar()) * 1000)
    const measure = async action => {
        await settle(page)
        const before = await busySoFar()
        await action()
        await settle(page)
        return Math.round(((await busySoFar()) - before) * 1000)
    }
    return { mount, measure }
}

/** Runs `action(i)` REPEAT times, and records the median of what each run cost. */
async function record (scenario, name, measure, action) {
    const runs = []
    for (let i = 0; i < REPEAT; i++) runs.push(await measure(() => action(i)))
    results[scenario][name] = { median: median(runs), runs }
}

/**
 * Adds a scenario's numbers to PERF_OUT, then checks them against its ceilings. A failed test's worker is replaced,
 * and this module's state with it, so the file, not `results`, is what holds every scenario's.
 */
function check (scenario) {
    const out = process.env.PERF_OUT
    if (out) {
        const sofar = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {}
        fs.writeFileSync(out, `${JSON.stringify({ ...sofar, [scenario]: results[scenario] }, null, 2)}\n`)
    }
    for (const [name, ceiling] of Object.entries(CEILINGS[scenario])) {
        expect.soft(results[scenario][name].median, `${scenario}: ${name}`).toBeLessThan(ceiling)
    }
}

test('a 200-row period table: an edit of a date, and a blur', async ({ page }) => {
    const { mount, measure } = await open(page, 'periods')
    results.periods = { mount: { median: mount, runs: [mount] } }
    const start = page.locator('input[name="dataKind.period[1].startDate"]')
    const month = i => `0${2 + (i % 2)}`
    await record('periods', 'edit', measure, async i => {
        await start.click()
        await start.fill(`2001-${month(i)}-01`)
        await start.press('Enter')
    })
    // The field shows the last run's date in the default date format, MM-DD-YYYY.
    await expect(start).toHaveValue(`${month(REPEAT - 1)}-01-2001`)
    // Each run blurs a field no earlier run has: only a field's first blur marks it touched.
    await record('periods', 'blur', measure, async i => {
        const end = page.locator(`input[name="dataKind.period[${10 + i}].endDate"]`)
        await end.focus()
        await end.evaluate(element => element.blur())
    })
    check('periods')
})

test('a 200-row table with a Select column: an edit of a note, and a blur', async ({ page }) => {
    const { mount, measure } = await open(page, 'selectTable')
    results.selectTable = { mount: { median: mount, runs: [mount] } }
    const note = page.locator('input[name="rows[1].note"]')
    await record('selectTable', 'edit', measure, i => note.fill(`edited ${i}`))
    await expect(note).toHaveValue(`edited ${REPEAT - 1}`)
    // Each run blurs a field no earlier run has: only a field's first blur marks it touched.
    await record('selectTable', 'blur', measure, async i => {
        const untouched = page.locator(`input[name="rows[${10 + i}].note"]`)
        await untouched.focus()
        await untouched.evaluate(element => element.blur())
    })
    check('selectTable')
})

test('a form of 100 named Selects: a pick, and an edit of its text field', async ({ page }) => {
    const { mount, measure } = await open(page, 'selectForm')
    results.selectForm = { mount: { median: mount, runs: [mount] } }
    const choice = page.getByRole('combobox', { name: 'Choice 1', exact: true })
    const pick = i => (i % 2 ? 'C' : 'B')
    await record('selectForm', 'pick', measure, async i => {
        await choice.click()
        await page.getByRole('option', { name: pick(i), exact: true }).click()
    })
    await expect(choice).toHaveText(pick(REPEAT - 1), { useInnerText: true })
    const other = page.getByRole('textbox', { name: 'Other', exact: true })
    await record('selectForm', 'edit', measure, i => other.fill(`edited ${i}`))
    await expect(other).toHaveValue(`edited ${REPEAT - 1}`)
    check('selectForm')
})

test('two tabs, the second a 200-row table: a switch to it, and back', async ({ page }) => {
    const { mount, measure } = await open(page, 'tabs')
    results.tabs = { mount: { median: mount, runs: [mount] } }
    const rows = page.getByRole('tab', { name: 'Rows', exact: true })
    const summary = page.getByRole('tab', { name: 'Summary', exact: true })
    const cell = page.locator('input[name="rows[1].note"]')
    // A switch waits for the table's field to be there, and a switch back for it to be gone.
    const switches = []
    const backs = []
    for (let i = 0; i < REPEAT; i++) {
        switches.push(await measure(async () => {
            await rows.click()
            await cell.waitFor()
        }))
        backs.push(await measure(async () => {
            await summary.click()
            await cell.waitFor({ state: 'detached' })
        }))
    }
    results.tabs.switch = { median: median(switches), runs: switches }
    results.tabs.back = { median: median(backs), runs: backs }
    await rows.click()
    await expect(cell).toHaveValue('note 1')
    check('tabs')
})

test('a 200-row table of bounded number fields: an edit of a number', async ({ page }) => {
    const { mount, measure } = await open(page, 'numberTable')
    results.numberTable = { mount: { median: mount, runs: [mount] } }
    const qty = page.locator('input[name="rows[1].qty"]')
    await record('numberTable', 'edit', measure, i => qty.fill(String(10 + i)))
    await expect(qty).toHaveValue(String(10 + REPEAT - 1))
    check('numberTable')
})
