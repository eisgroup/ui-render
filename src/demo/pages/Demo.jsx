import Upload from 'ui-modules-pack/upload/views/Upload'
import { FILE } from 'ui-modules-pack/variables'
import React, { useMemo } from 'react'
import JsonView from 'ui-react-pack/JsonView'
import Row from 'ui-react-pack/Row'
import ScrollView from 'ui-react-pack/ScrollView'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { GET, isEmpty, l, localiseTranslation, performStorage, SET } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import UIRender from '../../core/pages/main/rules'
import { Button } from 'ui-react-pack/Button'
import { PopupContext } from '../../core/contexts'

const DEMO_JSON_STORAGE_KEY = 'DEMO_JSON'

const Demo = () => {
    const [data, setData] = React.useState(() => {
        const data = performStorage(GET, DEMO_JSON_STORAGE_KEY) || {}
        return data.data || {
            json: undefined,
            name: undefined,
        }
    })
    const [meta, setMeta] = React.useState({
        json: undefined,
        name: undefined,
    })
    const getFormData = React.useRef()
    const popup = React.useContext(PopupContext)

    const onGetDataButtonClick = () => {
        const data = getFormData.current()
        console.info('Form data: ', data)
    }

    const handleUpload = (kind, [file]) => {
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                let json = JSON.parse(reader.result)
                if (kind === 'data') {
                    setData({ json, name: file.name })
                    performStorage(SET, DEMO_JSON_STORAGE_KEY, { data: { json, name: file.name } })
                } else {
                    setMeta({ json, name: file.name })
                }
            } catch (error) {
                popup.setPopupState({
                    isOpen: true,
                    title: `${file.name} is invalid ${kind} file`,
                    content: <View>
                        <Text className="h5">{_.ERROR_MESSAGE}</Text>
                        <Text className="p">{String(error)}</Text>
                    </View>,
                })
                console.log(error)
            }
        }
        reader.readAsText(file)
    }

    const hasData = useMemo(() => {
        return data.json != null // data.json can be empty object
    }, [data.json])

    const hasMeta = useMemo(() => {
        return !isEmpty(meta.json)
    }, [meta.json])

    return (
        <>
            <ScrollView className="padding-smaller bg-neutral inverted">
                <Row className="wrap spread">
                    <View className="margin-smaller">
                        <Upload {...uploadProps} label="*_data.json"
                                onChange={(file) => handleUpload('data', file)}
                                className={'test-data radius-large' + (!hasData ? ' bg-primary-dark' : '')}
                        >
                            {data.name &&
                                <View><Text className="h4">{_.UPLOADED}</Text><Text>{data.name}</Text></View>}
                        </Upload>
                    </View>
                    <View className="margin-smaller">
                        <Upload {...uploadProps} label="*_meta.json"
                            onChange={(file) => handleUpload('meta', file)}
                            className={'test-meta radius-large' + (hasData && !hasMeta ? ' bg-primary-dark' : '')}
                            disabled={!hasData}
                        >
                            {meta.name &&
                                <View><Text className="h4">{_.UPLOADED}</Text><Text>{meta.name}</Text></View>}
                        </Upload>
                    </View>
                    <View className="margin-smaller min-width-290">
                        <Row className="middle justify">
                            {hasMeta && <Text className="h6 no-margin fade-in-up">{_.CONFIG_USED}</Text>}
                        </Row>
                        {hasMeta && <View className="fade-in-down"><JsonView data={meta.json} inverted/></View>}
                    </View>
                </Row>
            </ScrollView>

            <UIRender
                form
                className="bg-info-light"
                initialValues={data.json}
                data={data.json}
                meta={meta.json}
                translate={(v) => v}
                onSubmit={console.warn}
                getFormData={(f) => getFormData.current = f}
            />
            {hasData && hasMeta &&
                <View className="app__examples bg-white border" style={{ marginTop: 20 }}>
                    <Button onClick={onGetDataButtonClick}>
                        Output the current data state to the dev console
                    </Button>
                </View>
            }
        </>
    )
}

export default Demo

const uploadProps = {
    hasHeader: false,
    multiple: false,
    fileType: FILE.TYPE.JSON,
    get labelOnHover () {
        return _.FORMAT
    }
}

localiseTranslation({
    CONFIG_USED: {
        [l.ENGLISH]: 'Config Used',
    },
    FILE: {
        [l.ENGLISH]: 'File',
    },
    FILES_ONLY: {
        [l.ENGLISH]: 'files only',
    },
    FILE_UPLOAD_FAILED: {
        [l.ENGLISH]: 'File Upload Failed!',
    },
    FORMAT: {
        [l.ENGLISH]: 'Format',
    },
    MAXIMUM_FILE_SIZE_EXCEEDED: {
        [l.ENGLISH]: 'Maximum File Size Exceeded!',
    },
    MUST_BE_UNDER: {
        [l.ENGLISH]: 'must be under',
    },
    SELECT_OR_DROP: {
        [l.ENGLISH]: 'Select or Drop',
    },
    UPDATING: {
        [l.ENGLISH]: 'Updating',
    },
    UPLOAD: {
        // as verb
        [l.ENGLISH]: 'Upload',
    },
    UPLOAD_file: {
        // as verb
        [l.ENGLISH]: 'Upload {file}',
    },
    UPLOADED: {
        // as verb
        [l.ENGLISH]: 'Uploaded',
    },

    // Popup Messages
    // ---------------------------------------------------------------------------
    ARE_YOU_SURE_YOU_WANT_TO_REMOVE_file: {
        [l.ENGLISH]: 'Are you sure you want to remove {file}?',
    },
    DIMENSION_OF_file_MUST_BE_ONE_OF_aspectRatios: {
        [l.ENGLISH]: 'Dimension of {file} must be one of {aspectRatios}',
    },
    INVALID_ASPECT_RATIO: {
        [l.ENGLISH]: 'Invalid Aspect Ratio!',
    },
})
