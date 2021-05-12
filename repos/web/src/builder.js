import BuilderApp from '@eisgroup/ui-builder'
import { baseUiElementHooks, baseUiParentHooks, getDefaultUiComponentsConfigItem } from '@eisgroup/ui-components'
import React from 'react'
import { render } from 'react-dom'
import demoDefinitions from './demo/apiDefinitions'
// import buildingBlocks from './demo/buildingBlocks'
import { apiServices } from './demo/demoApiServices'
import { en, fr } from './demo/localization'
// import { dynamicLoadDemo, UIRender } from './demo/openl'

/**
 * ROOT APP VIEW ===============================================================
 * =============================================================================
 */

render(
  <BuilderApp
    apiDefinitions={demoDefinitions}
    editorConfig={{
      getDefaultConfigItem: getDefaultUiComponentsConfigItem,
      parentHooks: baseUiParentHooks,
      elementHooks: baseUiElementHooks,
    }}
    // renderConfig={{Render: UIRender}} // todo: remove after testing
    // globalContextEnabled // todo: remove after testing
    localizationBundles={[en, fr]}
    // buildingBlocks={buildingBlocks}
    // includeBaseComponents
    apiServices={apiServices}
    // dynamicLoad={dynamicLoadDemo}
  />,
  document.getElementById('ui-render')
)
