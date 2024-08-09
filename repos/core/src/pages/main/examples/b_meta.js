export default {
    'view': 'VerticalLayout',
    'name': null,
    'styles': null,
    'relativeData': null,
    'showIf': { 'relativeData': null, 'name': 'isExperienceHidden', 'equal': false },
    'items': [{
        '@class': 'org.openl.generated.beans.Layout',
        'view': 'VerticalLayout',
        'name': null,
        'styles': 'bg-neutral padding-larger margin-top-larger',
        'relativeData': null,
        'showIf': null,
        'items': [{
            '@class': 'org.openl.generated.beans.Title',
            'view': 'Title',
            'label': 'Experience Rating',
            'renderLabel': null,
            'styles': 'padding-v-smaller'
        }, {
            '@class': 'org.openl.generated.beans.Row',
            'view': 'Row',
            'name': null,
            'items': [{
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'isExperienceAvailable',
                'label': ' ',
                'type': 'toggle',
                'format': null,
                'disabled': null,
                'relativeData': null,
                'autoSubmit': null,
                'removable': null,
                'min': null,
                'className': null,
                'compact': null,
                'placeholder': null,
                'validate': null,
                'verify': null,
                'icon': null,
                'lefty': null,
                'onChange': 'updateDataOnChange',
                'styles': null,
                'showIf': null,
                'style': null,
                'renderCell': null,
                'outputFormat': null
            }, {
                '@class': 'org.openl.generated.beans.Text',
                'view': 'Text',
                'label': 'Is Experience Available?',
                'renderLabel': null,
                'children': null,
                'className': null,
                'styles': 'padding-left'
            }],
            'styles': 'middle'
        }],
        'version': null,
        'style': null
    }, {
        '@class': 'org.openl.generated.beans.Layout',
        'view': 'VerticalLayout',
        'name': null,
        'styles': null,
        'relativeData': null,
        'showIf': { 'relativeData': null, 'name': 'isExperienceAvailable', 'equal': true },
        'items': [{
            '@class': 'org.openl.generated.beans.Tabs', 'view': 'Tabs', 'items': [{
                'view': 'Tab', 'tab': 'Policy Inputs', 'content': {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'name': null,
                    'styles': 'bg-neutral padding-larger border',
                    'relativeData': null,
                    'showIf': null,
                    'items': [{
                        '@class': 'org.openl.generated.beans.Title',
                        'view': 'Title',
                        'label': 'Policy Inputs',
                        'renderLabel': null,
                        'styles': 'h6 padding-v-smaller'
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'wrap margin-bottom-smaller width-50p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{ '@class': 'org.openl.generated.beans.Element', 'view': 'Space' }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Eligible Lives:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.policyInputs.eligibleLives',
                                        'label': null,
                                        'type': 'number',
                                        'format': 'integer',
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Participating Lives:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.policyInputs.participatingLives',
                                        'label': null,
                                        'type': 'number',
                                        'format': 'integer',
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Produced by AON?',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': 'experienceRatingInputs.policyInputs',
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'producedByAONSelection',
                                        'options': {
                                            'name': 'producedByAONList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': { 'text': 'producedByAON', 'value': 'producedByAON' },
                                        'styles': 'middle fill-width right',
                                        'disabled': null,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Paid Claim Basis:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': 'experienceRatingInputs.policyInputs',
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'paidClaimBasisSelection',
                                        'options': {
                                            'name': 'paidClaimBasisList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': { 'text': 'paidClaimBasis', 'value': 'paidClaimBasis' },
                                        'styles': 'middle fill-width right',
                                        'disabled': null,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Original Effective Date:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.policyInputs.originalEffectiveDate',
                                        'label': null,
                                        'type': 'date',
                                        'format': 'date',
                                        'disabled': null,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': 'required',
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Select Yes if RSL will pay FICA tax on behalf of the Employer AND this is not reflected in the experience (New Business or new this year):',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': 'experienceRatingInputs.policyInputs',
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'ficaNotIncludedInExperienceSelection',
                                        'options': {
                                            'name': 'ficaNotIncludedInExperienceList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': {
                                            'text': 'ficaNotIncludedInExperience',
                                            'value': 'ficaNotIncludedInExperience'
                                        },
                                        'styles': 'middle fill-width right',
                                        'disabled': null,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'First-time FMLA Outsourcing:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': 'experienceRatingInputs.policyInputs',
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'firstTimeFMLAOutsourcingSelection',
                                        'options': {
                                            'name': 'firstTimeFMLAOutsourcingList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': {
                                            'text': 'firstTimeFMLAOutsourcing',
                                            'value': 'firstTimeFMLAOutsourcing'
                                        },
                                        'styles': 'middle fill-width right',
                                        'disabled': null,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-75p',
                                'relativeData': null,
                                'showIf': {
                                    'relativeData': null,
                                    'name': 'experienceRatingInputs.policyInputs.firstTimeFMLAOutsourcingSelection',
                                    'equal': 'Yes'
                                },
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'First time FMLA outsources carry risk of increased STD incidence in the future. This risk is especially pronounced in mid-market groups.',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': 'warning padding-smallest no-margin',
                                    'styles': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-100p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Which Plan\'s Provisions will be Used in Experience Rating?',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': 'experienceRatingInputs.policyInputs',
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'planForExperienceRatingSelection',
                                        'options': {
                                            'name': 'planForExperienceRatingList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': { 'text': 'planName', 'value': 'planName' },
                                        'styles': 'middle fill-width right',
                                        'disabled': null,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': true
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'wrap margin-bottom-smaller width-50p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Table',
                                'view': 'Table',
                                'name': 'experienceRatingInputs.policyInputs.planProvisions',
                                'styles': 'margin-v border width-75p',
                                'headers': [{
                                    'id': 'planName',
                                    'label': { 'name': 'Plan' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'accidentEP',
                                    'label': { 'name': 'Accident Elimination Period' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'sicknessEP',
                                    'label': { 'name': 'Sickness Elimination Period' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'maximumDuration',
                                    'label': { 'name': 'Maximum Duration' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'erContributionPct',
                                    'label': { 'name': 'Employer Contribution %' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Percent',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'totalCoreVolume',
                                    'label': { 'name': 'Total Core Volume' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }],
                                'showIf': null,
                                'relativeData': null,
                                'renderItem': null,
                                'renderItemCells': null,
                                'vertical': true,
                                'renderExtraItem': null,
                                'itemsExpanded': null,
                                'colGroup': null
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }],
                    'version': null,
                    'style': null
                }
            }, {
                'view': 'Tab', 'tab': 'Periods', 'content': {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'name': null,
                    'styles': 'bg-neutral padding-larger border',
                    'relativeData': null,
                    'showIf': null,
                    'items': [{
                        '@class': 'org.openl.generated.beans.Title',
                        'view': 'Title',
                        'label': 'Periods',
                        'renderLabel': null,
                        'styles': 'h6 padding-v-smaller'
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingInputs.isRenewalOrAmendment',
                                'equal': false
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Table',
                                'view': 'Table',
                                'name': 'experienceRatingInputs.dataKind.experiencePeriods',
                                'styles': 'margin-v no-border',
                                'headers': [{
                                    'id': 'periodName',
                                    'label': { 'name': 'Period' },
                                    'classNameHeader': 'padding-left-small border-right',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'startDate',
                                    'label': { 'name': 'Period Start' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'endDate',
                                    'label': { 'name': 'Period End' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'calculatedWeight',
                                    'label': { 'name': 'Calculated Weight' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Float',
                                        'decimals': 2
                                    },
                                    'renderLabel': { 'name': null, 'decimals': 2 },
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'weightOverride',
                                    'label': { 'name': 'Weight Override Percentage' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Float',
                                        'decimals': 2
                                    },
                                    'renderLabel': { 'name': null, 'decimals': 2 },
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'averageLives',
                                    'label': { 'name': 'Average Participating Lives' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidPremium',
                                    'label': { 'name': 'Paid Premium' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidClaims',
                                    'label': { 'name': 'Paid Claims' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'maximumDurationOverride',
                                    'label': { 'name': 'Maximum Duration (weeks)' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': null,
                                    'label': { 'name': '' },
                                    'classNameHeader': 'align-center',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }],
                                'showIf': null,
                                'relativeData': false,
                                'renderItem': null,
                                'renderItemCells': {
                                    'view': 'Data', 'kind': 'experiencePeriods', 'embedded': true, 'meta': {
                                        'view': 'TableCells',
                                        'style': {
                                            'minWidth': null,
                                            'marginTop': null,
                                            'verticalAlign': 'top',
                                            'borderColor': null,
                                            'width': null
                                        },
                                        'styles': 'no-border-right-last-item',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'periodName',
                                            'label': null,
                                            'type': 'text',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover border-right',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'startDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'endDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'calculatedWeight',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'weightOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLives',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'integer',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremium',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaims',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'maximumDurationOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': true,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'isCurrentPeriod',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Button',
                                                'view': 'Button',
                                                'styles': 'a transparent',
                                                'style': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Icon',
                                                    'view': 'Icon',
                                                    'name': 'trash',
                                                    'styles': null
                                                }],
                                                'onClick': { 'name': 'removeData', 'args': null },
                                                'children': null,
                                                'disabled': null
                                            }],
                                            'version': null,
                                            'style': null
                                        }]
                                    }
                                },
                                'vertical': null,
                                'renderExtraItem': {
                                    'view': 'Data', 'kind': 'experiencePeriods', 'embedded': true, 'meta': {
                                        'view': 'TableCells',
                                        'style': {
                                            'minWidth': null,
                                            'marginTop': null,
                                            'verticalAlign': 'top',
                                            'borderColor': null,
                                            'width': null
                                        },
                                        'styles': 'fade--quarter',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': false,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Select',
                                                'view': 'Select',
                                                'name': 'periodName',
                                                'options': {
                                                    'name': 'experienceRatingInputs.periodNameList',
                                                    'relativeData': null,
                                                    'decimals': null
                                                },
                                                'mapOptions': { 'text': 'periodName', 'value': 'periodName' },
                                                'styles': 'middle width-100p right',
                                                'disabled': null,
                                                'validate': 'required',
                                                'compact': true,
                                                'value': '',
                                                'upward': true
                                            }],
                                            'version': null,
                                            'style': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'startDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'endDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'calculatedWeight',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'weightOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLives',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremium',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaims',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'maximumDurationOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Button',
                                                'view': 'Button',
                                                'styles': 'a transparent',
                                                'style': null,
                                                'items': null,
                                                'onClick': { 'name': 'addData', 'args': null },
                                                'children': 'Add',
                                                'disabled': null
                                            }],
                                            'version': null,
                                            'style': null
                                        }]
                                    }, 'initialValues': {}, 'relativeData': false
                                },
                                'itemsExpanded': null,
                                'colGroup': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingInputs.isRenewalOrAmendment',
                                'equal': true
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Table',
                                'view': 'Table',
                                'name': 'experienceRatingInputs.dataKind.experiencePeriods',
                                'styles': 'margin-v no-border',
                                'headers': [{
                                    'id': 'periodName',
                                    'label': { 'name': 'Period' },
                                    'classNameHeader': 'padding-left-small border-right',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'startDate',
                                    'label': { 'name': 'Period Start' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'endDate',
                                    'label': { 'name': 'Period End' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'calculatedWeight',
                                    'label': { 'name': 'Calculated Weight' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Float',
                                        'decimals': 2
                                    },
                                    'renderLabel': { 'name': null, 'decimals': 2 },
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'weightOverride',
                                    'label': { 'name': 'Weight Override Percentage' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Float',
                                        'decimals': 2
                                    },
                                    'renderLabel': { 'name': null, 'decimals': 2 },
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'averageLives',
                                    'label': { 'name': 'Average Participating Lives' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'averageLivesOverride',
                                    'label': { 'name': 'Average Participating Lives Override' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidPremium',
                                    'label': { 'name': 'Paid Premium' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidPremiumOverride',
                                    'label': { 'name': 'Paid Premium Override' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidClaims',
                                    'label': { 'name': 'Paid Claims' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'paidClaimsOverride',
                                    'label': { 'name': 'Paid Claims Override' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': {
                                        '@class': 'org.openl.generated.beans.RenderCell',
                                        'name': 'Currency',
                                        'decimals': null
                                    },
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'maximumDurationOverride',
                                    'label': { 'name': 'Maximum Duration (weeks)' },
                                    'classNameHeader': 'padding-left-small',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': null,
                                    'label': { 'name': '' },
                                    'classNameHeader': 'align-center',
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }],
                                'showIf': null,
                                'relativeData': false,
                                'renderItem': null,
                                'renderItemCells': {
                                    'view': 'Data', 'kind': 'experiencePeriods', 'embedded': true, 'meta': {
                                        'view': 'TableCells',
                                        'style': {
                                            'minWidth': null,
                                            'marginTop': null,
                                            'verticalAlign': 'top',
                                            'borderColor': null,
                                            'width': null
                                        },
                                        'styles': 'no-border-right-last-item',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'periodName',
                                            'label': null,
                                            'type': 'text',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover border-right',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'startDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'endDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'calculatedWeight',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'weightOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLives',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'integer',
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLivesOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'integer',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremium',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremiumOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaims',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaimsOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 0,
                                                'percentage': null,
                                                'separateThousands': true
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'maximumDurationOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'border-on-hover',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': true,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'isCurrentPeriod',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Button',
                                                'view': 'Button',
                                                'styles': 'a transparent',
                                                'style': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Icon',
                                                    'view': 'Icon',
                                                    'name': 'trash',
                                                    'styles': null
                                                }],
                                                'onClick': { 'name': 'removeData', 'args': null },
                                                'children': null,
                                                'disabled': null
                                            }],
                                            'version': null,
                                            'style': null
                                        }]
                                    }
                                },
                                'vertical': null,
                                'renderExtraItem': {
                                    'view': 'Data', 'kind': 'experiencePeriods', 'embedded': true, 'meta': {
                                        'view': 'TableCells',
                                        'style': {
                                            'minWidth': null,
                                            'marginTop': null,
                                            'verticalAlign': 'top',
                                            'borderColor': null,
                                            'width': null
                                        },
                                        'styles': 'fade--quarter',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': false,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Select',
                                                'view': 'Select',
                                                'name': 'periodName',
                                                'options': {
                                                    'name': 'experienceRatingInputs.periodNameList',
                                                    'relativeData': null,
                                                    'decimals': null
                                                },
                                                'mapOptions': { 'text': 'periodName', 'value': 'periodName' },
                                                'styles': 'middle width-100p right',
                                                'disabled': null,
                                                'validate': 'required',
                                                'compact': true,
                                                'value': '',
                                                'upward': true
                                            }],
                                            'version': null,
                                            'style': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'startDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'endDate',
                                            'label': null,
                                            'type': 'date',
                                            'format': 'date',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': {
                                                'dataKind': 'experiencePeriods',
                                                'validate': [{
                                                    'name': 'notWithinRange',
                                                    'args': ['startDate', 'endDate']
                                                }]
                                            },
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'calculatedWeight',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': true,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'weightOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 2,
                                                'percentage': true,
                                                'separateThousands': null
                                            }
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLives',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'averageLivesOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremium',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidPremiumOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaims',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'paidClaimsOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': 'currency',
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'maximumDurationOverride',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': null,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': null,
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': null,
                                            'verify': null,
                                            'icon': null,
                                            'lefty': null,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'experienceRatingInputs.allPeriodsAdded',
                                                'equal': false
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Button',
                                                'view': 'Button',
                                                'styles': 'a transparent',
                                                'style': null,
                                                'items': null,
                                                'onClick': { 'name': 'addData', 'args': null },
                                                'children': 'Add',
                                                'disabled': null
                                            }],
                                            'version': null,
                                            'style': null
                                        }]
                                    }, 'initialValues': {}, 'relativeData': false
                                },
                                'itemsExpanded': null,
                                'colGroup': null
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'padding-bottom',
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Select the experience periods and start and end dates that you wish to use, and then click “Apply Changes”. Please do this initial step before attempting to apply any desired Weight Overrides.',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Fields not required for the Third Prior Period are:',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': '• Weight Override Percentage',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': '• Average Participating Lives',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': '• Paid Claims',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': '• Maximum Duration (weeks)',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-smallest warning'
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'wrap width-75p padding-top',
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Input',
                                'view': 'Input',
                                'name': 'experienceRatingInputs.dataKind.weightOverrideReason',
                                'label': 'Weight Override Reason',
                                'type': 'textarea',
                                'format': null,
                                'disabled': null,
                                'relativeData': null,
                                'autoSubmit': null,
                                'removable': null,
                                'min': null,
                                'className': 'padding-v',
                                'compact': null,
                                'placeholder': null,
                                'validate': null,
                                'verify': null,
                                'icon': null,
                                'lefty': null,
                                'onChange': null,
                                'styles': 'full-width',
                                'showIf': null,
                                'style': null,
                                'renderCell': null,
                                'outputFormat': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-top-smallest',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'If you override weights, please ensure that the weights sum to 100%. Please provide a reason for overriding the default weights.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'wrap width-75p padding-top',
                        'relativeData': null,
                        'showIf': {
                            'relativeData': null,
                            'name': 'experienceRatingInputs.isRenewalOrAmendment',
                            'equal': true
                        },
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Input',
                                'view': 'Input',
                                'name': 'experienceRatingInputs.dataKind.averageLivesOverrideReason',
                                'label': 'Average Lives Override Reason',
                                'type': 'textarea',
                                'format': null,
                                'disabled': null,
                                'relativeData': null,
                                'autoSubmit': null,
                                'removable': null,
                                'min': null,
                                'className': 'padding-v',
                                'compact': null,
                                'placeholder': null,
                                'validate': null,
                                'verify': null,
                                'icon': null,
                                'lefty': null,
                                'onChange': null,
                                'styles': 'full-width',
                                'showIf': null,
                                'style': null,
                                'renderCell': null,
                                'outputFormat': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-top-smallest',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Please provide a reason for overriding the imported average lives.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'wrap width-75p padding-top',
                        'relativeData': null,
                        'showIf': {
                            'relativeData': null,
                            'name': 'experienceRatingInputs.isRenewalOrAmendment',
                            'equal': true
                        },
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Input',
                                'view': 'Input',
                                'name': 'experienceRatingInputs.dataKind.paidPremiumOverrideReason',
                                'label': 'Paid Premium Override Reason',
                                'type': 'textarea',
                                'format': null,
                                'disabled': null,
                                'relativeData': null,
                                'autoSubmit': null,
                                'removable': null,
                                'min': null,
                                'className': 'padding-v',
                                'compact': null,
                                'placeholder': null,
                                'validate': null,
                                'verify': null,
                                'icon': null,
                                'lefty': null,
                                'onChange': null,
                                'styles': 'full-width',
                                'showIf': null,
                                'style': null,
                                'renderCell': null,
                                'outputFormat': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-top-smallest',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Please provide a reason for overriding the imported paid premium.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'wrap width-75p padding-top',
                        'relativeData': null,
                        'showIf': {
                            'relativeData': null,
                            'name': 'experienceRatingInputs.isRenewalOrAmendment',
                            'equal': true
                        },
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': null,
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Input',
                                'view': 'Input',
                                'name': 'experienceRatingInputs.dataKind.paidClaimsOverrideReason',
                                'label': 'Paid Claims Override Reason',
                                'type': 'textarea',
                                'format': null,
                                'disabled': null,
                                'relativeData': null,
                                'autoSubmit': null,
                                'removable': null,
                                'min': null,
                                'className': 'padding-v',
                                'compact': null,
                                'placeholder': null,
                                'validate': null,
                                'verify': null,
                                'icon': null,
                                'lefty': null,
                                'onChange': null,
                                'styles': 'full-width',
                                'showIf': null,
                                'style': null,
                                'renderCell': null,
                                'outputFormat': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-top-smallest',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Please provide a reason for overriding the imported paid claims.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'middle padding-smallest no-margin width-25p',
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-top no-margin width-100p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'middle padding-smallest no-padding-left no-margin width-75p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Number of Historical Plans:',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'padding-smallest no-margin width-25p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Input',
                                    'view': 'Input',
                                    'name': 'experienceRatingInputs.dataKind.numberOfHistoricalPlans',
                                    'label': null,
                                    'type': 'number',
                                    'format': 'integer',
                                    'disabled': null,
                                    'relativeData': null,
                                    'autoSubmit': null,
                                    'removable': null,
                                    'min': null,
                                    'className': 'max-width-290 margin',
                                    'compact': null,
                                    'placeholder': null,
                                    'validate': null,
                                    'verify': null,
                                    'icon': null,
                                    'lefty': null,
                                    'onChange': null,
                                    'styles': 'middle fill-width',
                                    'showIf': null,
                                    'style': null,
                                    'renderCell': null,
                                    'outputFormat': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-smallest no-padding-left no-margin',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Enter the number of distinct Core plans.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'no-padding no-margin width-100p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'middle padding-smallest no-padding-left no-margin width-75p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Number of Historical Coverages:',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'padding-smallest no-margin width-25p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Input',
                                    'view': 'Input',
                                    'name': 'experienceRatingInputs.dataKind.numberOfHistoricalCoverages',
                                    'label': null,
                                    'type': 'number',
                                    'format': 'integer',
                                    'disabled': null,
                                    'relativeData': null,
                                    'autoSubmit': null,
                                    'removable': null,
                                    'min': null,
                                    'className': 'max-width-290 margin',
                                    'compact': null,
                                    'placeholder': null,
                                    'validate': null,
                                    'verify': null,
                                    'icon': null,
                                    'lefty': null,
                                    'onChange': null,
                                    'styles': 'middle fill-width',
                                    'showIf': null,
                                    'style': null,
                                    'renderCell': null,
                                    'outputFormat': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-smallest no-padding-left no-margin',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Enter 1 for Core coverage only.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }, {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Enter 2 for Core + BuyUp.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }, {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Enter 3 for Core + BuyUp1 + BuyUp2.',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'padding-smallest no-padding-left warning'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'name': null,
                        'styles': 'right',
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'right margin-h-largest',
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingInputs.isRenewalOrAmendment',
                                'equal': true
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Button',
                                'view': 'Button',
                                'styles': 'secondary',
                                'style': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Import Historical Data',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': null
                                }],
                                'onClick': { 'name': 'importHistoricalData', 'args': null },
                                'children': null,
                                'disabled': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'right margin-h-largest',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Button',
                                'view': 'Button',
                                'styles': 'primary',
                                'style': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Apply Changes',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': null
                                }],
                                'onClick': { 'name': 'onApplyPeriods', 'args': null },
                                'children': null,
                                'disabled': null
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }],
                    'version': null,
                    'style': null
                }
            }, {
                'view': 'Tab', 'tab': 'Historical Rates', 'content': {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'name': null,
                    'styles': 'bg-neutral padding-larger border',
                    'relativeData': null,
                    'showIf': null,
                    'items': [{
                        '@class': 'org.openl.generated.beans.Title',
                        'view': 'Title',
                        'label': 'Historical Rates',
                        'renderLabel': null,
                        'styles': 'h6 padding-v-smaller'
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-v',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Rate Basis:',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'bold'
                            }, {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': null,
                                'renderLabel': null,
                                'children': {
                                    'name': 'experienceRatingInputs.policyInputs.rateBasis',
                                    'relativeData': null,
                                    'decimals': null
                                },
                                'className': null,
                                'styles': 'padding-left-smaller'
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'padding-v',
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingInputs.policyInputs.buyUpVolume',
                                'equal': null
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Buy Up Volume:',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'bold'
                            }, {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': null,
                                'renderLabel': null,
                                'children': {
                                    'name': 'experienceRatingInputs.policyInputs.buyUpVolume',
                                    'relativeData': null,
                                    'decimals': null
                                },
                                'className': null,
                                'styles': 'padding-left-smaller'
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'width-25p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'middle no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Formula Rate Scaling Method:',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': 'padding-v bold'
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'padding-smallest no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Select',
                                    'view': 'Select',
                                    'name': 'experienceRatingInputs.policyInputs.scaleBasisSelection',
                                    'options': {
                                        'name': 'experienceRatingInputs.policyInputs.scaleBasisList',
                                        'relativeData': null,
                                        'decimals': null
                                    },
                                    'mapOptions': { 'text': 'scaleBasis', 'value': 'scaleBasis' },
                                    'styles': 'fill-width margin-left-small',
                                    'disabled': null,
                                    'validate': null,
                                    'compact': true,
                                    'value': null,
                                    'upward': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-smallest no-margin width-25p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Col',
                                'view': 'Col',
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Button',
                                    'view': 'Button',
                                    'styles': 'margin-left',
                                    'style': {
                                        'minWidth': null,
                                        'marginTop': null,
                                        'verticalAlign': null,
                                        'borderColor': null,
                                        'width': '150px'
                                    },
                                    'items': null,
                                    'onClick': { 'name': 'popupOpen', 'args': ['ScaleBasisCommentButton'] },
                                    'children': 'View Instructions',
                                    'disabled': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Popup',
                                    'view': 'Popup',
                                    'id': 'ScaleBasisCommentButton',
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'padding-left',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': 'Scale Basis Selection',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-v bold'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': 'The experience rating methodology will calculate a single, composite Formula Rate. Use this dropdown to indicate how you wish to obtain the full set of Formula Rates for all plans, coverages, and age bands that are needed for this case.',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '(If you have only one composite rated Core plan, the selection you make here does not matter.)',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Element',
                                            'view': 'Space'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• Select “Inforce” to indicate that you wish to scale all inforce rates proportionally, using a composite-Formula-to-composite-Inforce ratio. (This is recommended in most cases.)',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• Select “Manual” to indicate that you wish to scale all manual rates proportionally, using a composite-Formula-to-composite-Manual ratio.',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• Select “Preset Slope” to indicate that you wish to scale rates from a default slope. (This option is not recommended unless we do not have Inforce rates and cannot calculate reliable Manual rates.)',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }],
                                        'version': null,
                                        'style': null
                                    }]
                                }]
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'name': null,
                        'styles': null,
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'width-25p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'middle no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Text',
                                    'view': 'Text',
                                    'label': 'Freeze Inforce Buy-Ups?',
                                    'renderLabel': null,
                                    'children': null,
                                    'className': null,
                                    'styles': 'padding-v bold'
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'padding-smallest no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Select',
                                    'view': 'Select',
                                    'name': 'experienceRatingInputs.policyInputs.freezeBuyUpsSelection',
                                    'options': {
                                        'name': 'experienceRatingInputs.policyInputs.freezeBuyUpsList',
                                        'relativeData': null,
                                        'decimals': null
                                    },
                                    'mapOptions': { 'text': 'freezeBuyUps', 'value': 'freezeBuyUps' },
                                    'styles': 'fill-width margin-left-small',
                                    'disabled': null,
                                    'validate': null,
                                    'compact': true,
                                    'value': null,
                                    'upward': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-smallest no-margin width-25p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Col',
                                'view': 'Col',
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Button',
                                    'view': 'Button',
                                    'styles': 'margin-left',
                                    'style': {
                                        'minWidth': null,
                                        'marginTop': null,
                                        'verticalAlign': null,
                                        'borderColor': null,
                                        'width': '150px'
                                    },
                                    'items': null,
                                    'onClick': { 'name': 'popupOpen', 'args': ['FreezeBuyUpsCommentButton'] },
                                    'children': 'View Instructions',
                                    'disabled': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Popup',
                                    'view': 'Popup',
                                    'id': 'FreezeBuyUpsCommentButton',
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'padding-left',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': 'Freeze Inforce Buy-Ups Selection',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-v bold'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• If you select the “Inforce” rating scaling method, select “Yes” in this box to indicate that you wish to hold all buy-up rates at their current level, and apply rate changes only to Core rates.',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• Select “No” to indicate that all rates should be scaled by the same ratio. (If this case does not have buy-ups, the selection you make here does not matter.)',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '• If you select the “Manual” or “Preset Slope” rate scaling method, you must select “No”.',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-smallest'
                                        }],
                                        'version': null,
                                        'style': null
                                    }]
                                }]
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'padding-v',
                        'relativeData': null,
                        'showIf': null,
                        'items': [{
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Note: if there are multiple plans on this quote/policy, it is essential that you enter historical rates by plan in the same order that you set the plans up during manual rating step.',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-v-smallest warning'
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'For instance, if you have two Core plans, be sure that the historical rates you enter below for Plan 1 are applicable to Plan 1 as set up during manual rating.',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'padding-v-smallest warning'
                        }],
                        'version': null,
                        'style': null
                    }, {
                        '@class': 'org.openl.generated.beans.Table',
                        'view': 'Table',
                        'name': 'experienceRatingInputs.historicalRates',
                        'styles': 'margin-v no-border',
                        'headers': [{
                            'id': 'periodName',
                            'label': { 'name': 'Period' },
                            'classNameHeader': null,
                            'classNameCellWrap': null,
                            'renderCell': null,
                            'renderLabel': null,
                            'renderHeader': null,
                            'classNameCell': null
                        }, {
                            'id': '#',
                            'label': null,
                            'classNameHeader': null,
                            'classNameCellWrap': null,
                            'renderCell': null,
                            'renderLabel': null,
                            'renderHeader': {
                                'view': 'Checkbox',
                                'label': 'Expand All',
                                'onChange': 'handleToggleExpandAll',
                                'defaultValue': true
                            },
                            'classNameCell': null
                        }],
                        'showIf': null,
                        'relativeData': null,
                        'renderItem': {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'bg-neutral padding-larger margin-top-large',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'width-25p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'HorizontalLayout',
                                    'name': null,
                                    'styles': 'left margin-left width-100p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'width-50p',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': 'Use Single Rate?',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-v bold'
                                        }],
                                        'version': null,
                                        'style': null
                                    }, {
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'width-50p',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Select',
                                            'view': 'Select',
                                            'name': 'useSingleRateSelection',
                                            'options': {
                                                'name': 'useSingleRateList',
                                                'relativeData': null,
                                                'decimals': null
                                            },
                                            'mapOptions': { 'text': 'useSingleRate', 'value': 'useSingleRate' },
                                            'styles': 'fill-width margin-left-small',
                                            'disabled': null,
                                            'validate': null,
                                            'compact': true,
                                            'value': null,
                                            'upward': null
                                        }],
                                        'version': null,
                                        'style': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': 'width-25p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'HorizontalLayout',
                                    'name': null,
                                    'styles': 'left margin-left width-100p',
                                    'relativeData': null,
                                    'showIf': {
                                        'relativeData': null,
                                        'name': 'useSingleRateSelection',
                                        'equal': 'Yes'
                                    },
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'width-50p',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': 'Composite Rate:',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': null,
                                            'styles': 'padding-top'
                                        }],
                                        'version': null,
                                        'style': null
                                    }, {
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'width-50p',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Input',
                                            'view': 'Input',
                                            'name': 'compositeRate',
                                            'label': null,
                                            'type': 'number',
                                            'format': null,
                                            'disabled': null,
                                            'relativeData': true,
                                            'autoSubmit': null,
                                            'removable': null,
                                            'min': null,
                                            'className': 'fill-width margin-left-small',
                                            'compact': null,
                                            'placeholder': null,
                                            'validate': 'required',
                                            'verify': null,
                                            'icon': {
                                                '@class': 'org.openl.generated.beans.Text',
                                                'view': 'Text',
                                                'label': '$',
                                                'renderLabel': null,
                                                'children': null,
                                                'className': 'icon',
                                                'styles': null
                                            },
                                            'lefty': true,
                                            'onChange': null,
                                            'styles': null,
                                            'showIf': null,
                                            'style': null,
                                            'renderCell': null,
                                            'outputFormat': {
                                                'decimals': 3,
                                                'percentage': null,
                                                'separateThousands': null
                                            }
                                        }],
                                        'version': null,
                                        'style': null
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'name': null,
                                'styles': null,
                                'relativeData': null,
                                'showIf': { 'relativeData': null, 'name': 'useSingleRateSelection', 'equal': 'No' },
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Table',
                                    'view': 'Table',
                                    'name': 'historicalPlanRates',
                                    'styles': 'margin-v no-border',
                                    'headers': [{
                                        'id': 'planName',
                                        'label': { 'name': 'Plan' },
                                        'classNameHeader': null,
                                        'classNameCellWrap': null,
                                        'renderCell': null,
                                        'renderLabel': null,
                                        'renderHeader': null,
                                        'classNameCell': null
                                    }, {
                                        'id': null,
                                        'label': { 'name': '' },
                                        'classNameHeader': 'align-center',
                                        'classNameCellWrap': null,
                                        'renderCell': null,
                                        'renderLabel': null,
                                        'renderHeader': null,
                                        'classNameCell': null
                                    }, {
                                        'id': '#',
                                        'label': null,
                                        'classNameHeader': null,
                                        'classNameCellWrap': null,
                                        'renderCell': null,
                                        'renderLabel': null,
                                        'renderHeader': {
                                            'view': 'Checkbox',
                                            'label': 'Expand All',
                                            'onChange': 'handleToggleExpandAll',
                                            'defaultValue': true
                                        },
                                        'classNameCell': null
                                    }],
                                    'showIf': null,
                                    'relativeData': null,
                                    'renderItem': {
                                        '@class': 'org.openl.generated.beans.Layout',
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'left',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'VerticalLayout',
                                            'name': null,
                                            'styles': 'width-25p',
                                            'relativeData': null,
                                            'showIf': null,
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'HorizontalLayout',
                                                'name': null,
                                                'styles': 'left margin-left-smallest width-100p',
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Layout',
                                                    'view': 'VerticalLayout',
                                                    'name': null,
                                                    'styles': 'width-50p',
                                                    'relativeData': null,
                                                    'showIf': null,
                                                    'items': [{
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': 'Is Plan Applicable?',
                                                        'renderLabel': null,
                                                        'children': null,
                                                        'className': null,
                                                        'styles': 'padding-top'
                                                    }],
                                                    'version': null,
                                                    'style': null
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Layout',
                                                    'view': 'VerticalLayout',
                                                    'name': null,
                                                    'styles': 'width-50p',
                                                    'relativeData': null,
                                                    'showIf': null,
                                                    'items': [{
                                                        '@class': 'org.openl.generated.beans.Select',
                                                        'view': 'Select',
                                                        'name': 'isApplicableSelection',
                                                        'options': {
                                                            'name': 'isApplicableList',
                                                            'relativeData': null,
                                                            'decimals': null
                                                        },
                                                        'mapOptions': {
                                                            'text': 'isApplicable',
                                                            'value': 'isApplicable'
                                                        },
                                                        'styles': 'middle fill-width margin-left-smaller margin-right-smallest',
                                                        'disabled': null,
                                                        'validate': null,
                                                        'compact': true,
                                                        'value': null,
                                                        'upward': null
                                                    }],
                                                    'version': null,
                                                    'style': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }],
                                            'version': null,
                                            'style': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Layout',
                                            'view': 'HorizontalLayout',
                                            'name': null,
                                            'styles': null,
                                            'relativeData': null,
                                            'showIf': {
                                                'relativeData': null,
                                                'name': 'isApplicableSelection',
                                                'equal': 'Yes'
                                            },
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.RowList',
                                                'view': 'RowList',
                                                'name': 'historicalCoverageRates',
                                                'renderItem': {
                                                    'view': 'VerticalLayout',
                                                    'name': null,
                                                    'styles': 'left padding-bottom margin-h-largest',
                                                    'relativeData': null,
                                                    'showIf': null,
                                                    'items': [{
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': null,
                                                        'renderLabel': null,
                                                        'children': {
                                                            'name': 'coverageType',
                                                            'relativeData': null,
                                                            'decimals': null
                                                        },
                                                        'className': null,
                                                        'styles': 'padding-v bold'
                                                    }, {
                                                        '@class': 'org.openl.generated.beans.Layout',
                                                        'view': 'VerticalLayout',
                                                        'name': null,
                                                        'styles': 'left margin-top-smaller full-width margin-right',
                                                        'relativeData': null,
                                                        'showIf': null,
                                                        'items': [{
                                                            '@class': 'org.openl.generated.beans.Layout',
                                                            'view': 'HorizontalLayout',
                                                            'name': null,
                                                            'styles': 'no-padding fill-width',
                                                            'relativeData': null,
                                                            'showIf': null,
                                                            'items': [{
                                                                '@class': 'org.openl.generated.beans.Layout',
                                                                'view': 'VerticalLayout',
                                                                'name': null,
                                                                'styles': 'wrap margin-bottom-smaller width-50p',
                                                                'relativeData': null,
                                                                'showIf': null,
                                                                'items': [{
                                                                    '@class': 'org.openl.generated.beans.Text',
                                                                    'view': 'Text',
                                                                    'label': 'Is Applicable?',
                                                                    'renderLabel': null,
                                                                    'children': null,
                                                                    'className': null,
                                                                    'styles': 'padding-top'
                                                                }],
                                                                'version': null,
                                                                'style': null
                                                            }, {
                                                                '@class': 'org.openl.generated.beans.Layout',
                                                                'view': 'VerticalLayout',
                                                                'name': null,
                                                                'styles': 'wrap margin-bottom-smaller width-50p',
                                                                'relativeData': null,
                                                                'showIf': null,
                                                                'items': [{
                                                                    '@class': 'org.openl.generated.beans.Select',
                                                                    'view': 'Select',
                                                                    'name': 'isApplicableSelection',
                                                                    'options': {
                                                                        'name': 'isApplicableList',
                                                                        'relativeData': null,
                                                                        'decimals': null
                                                                    },
                                                                    'mapOptions': {
                                                                        'text': 'isApplicable',
                                                                        'value': 'isApplicable'
                                                                    },
                                                                    'styles': 'middle fill-width right',
                                                                    'disabled': null,
                                                                    'validate': null,
                                                                    'compact': true,
                                                                    'value': null,
                                                                    'upward': null
                                                                }],
                                                                'version': null,
                                                                'style': null
                                                            }],
                                                            'version': null,
                                                            'style': null
                                                        }, {
                                                            '@class': 'org.openl.generated.beans.Layout',
                                                            'view': 'HorizontalLayout',
                                                            'name': null,
                                                            'styles': 'no-padding fill-width',
                                                            'relativeData': null,
                                                            'showIf': {
                                                                'relativeData': null,
                                                                'name': 'isApplicableSelection',
                                                                'equal': 'Yes'
                                                            },
                                                            'items': [{
                                                                '@class': 'org.openl.generated.beans.Layout',
                                                                'view': 'VerticalLayout',
                                                                'name': null,
                                                                'styles': 'wrap margin-bottom-smaller width-50p',
                                                                'relativeData': null,
                                                                'showIf': null,
                                                                'items': [{
                                                                    '@class': 'org.openl.generated.beans.Text',
                                                                    'view': 'Text',
                                                                    'label': 'Rate Type:',
                                                                    'renderLabel': null,
                                                                    'children': null,
                                                                    'className': null,
                                                                    'styles': 'padding-top'
                                                                }],
                                                                'version': null,
                                                                'style': null
                                                            }, {
                                                                '@class': 'org.openl.generated.beans.Layout',
                                                                'view': 'VerticalLayout',
                                                                'name': null,
                                                                'styles': 'wrap margin-bottom-smaller width-50p',
                                                                'relativeData': null,
                                                                'showIf': null,
                                                                'items': [{
                                                                    '@class': 'org.openl.generated.beans.Select',
                                                                    'view': 'Select',
                                                                    'name': 'payableRateTypeSelection',
                                                                    'options': {
                                                                        'name': 'payableRateTypeList',
                                                                        'relativeData': null,
                                                                        'decimals': null
                                                                    },
                                                                    'mapOptions': {
                                                                        'text': 'payableRateType',
                                                                        'value': 'payableRateType'
                                                                    },
                                                                    'styles': 'middle fill-width right',
                                                                    'disabled': null,
                                                                    'validate': null,
                                                                    'compact': true,
                                                                    'value': null,
                                                                    'upward': null
                                                                }],
                                                                'version': null,
                                                                'style': null
                                                            }],
                                                            'version': null,
                                                            'style': null
                                                        }],
                                                        'version': null,
                                                        'style': null
                                                    }, {
                                                        '@class': 'org.openl.generated.beans.Layout',
                                                        'view': 'VerticalLayout',
                                                        'name': null,
                                                        'styles': 'left margin-top-smaller',
                                                        'relativeData': null,
                                                        'showIf': {
                                                            'relativeData': null,
                                                            'name': 'isApplicableSelection',
                                                            'equal': 'Yes'
                                                        },
                                                        'items': [{
                                                            '@class': 'org.openl.generated.beans.Layout',
                                                            'view': 'VerticalLayout',
                                                            'name': null,
                                                            'styles': 'left margin-top-smaller',
                                                            'relativeData': null,
                                                            'showIf': {
                                                                'relativeData': null,
                                                                'name': 'payableRateTypeSelection',
                                                                'equal': 'Composite'
                                                            },
                                                            'items': [{
                                                                '@class': 'org.openl.generated.beans.Table',
                                                                'view': 'Table',
                                                                'name': 'compositeRate',
                                                                'styles': 'full-width',
                                                                'headers': [{
                                                                    'id': 'rate',
                                                                    'label': { 'name': 'Composite Rate:' },
                                                                    'classNameHeader': null,
                                                                    'classNameCellWrap': null,
                                                                    'renderCell': {
                                                                        '@class': 'org.openl.generated.beans.Input',
                                                                        'view': 'Input',
                                                                        'name': 'rate',
                                                                        'label': null,
                                                                        'type': 'number',
                                                                        'format': null,
                                                                        'disabled': null,
                                                                        'relativeData': null,
                                                                        'autoSubmit': null,
                                                                        'removable': null,
                                                                        'min': null,
                                                                        'className': 'border-on-hover',
                                                                        'compact': null,
                                                                        'placeholder': null,
                                                                        'validate': 'required',
                                                                        'verify': null,
                                                                        'icon': {
                                                                            '@class': 'org.openl.generated.beans.Text',
                                                                            'view': 'Text',
                                                                            'label': '$',
                                                                            'renderLabel': null,
                                                                            'children': null,
                                                                            'className': 'icon',
                                                                            'styles': null
                                                                        },
                                                                        'lefty': true,
                                                                        'onChange': null,
                                                                        'styles': null,
                                                                        'showIf': null,
                                                                        'style': {
                                                                            'minWidth': null,
                                                                            'marginTop': null,
                                                                            'verticalAlign': null,
                                                                            'borderColor': null,
                                                                            'width': '150px'
                                                                        },
                                                                        'renderCell': null,
                                                                        'outputFormat': {
                                                                            'decimals': 3,
                                                                            'percentage': null,
                                                                            'separateThousands': null
                                                                        }
                                                                    },
                                                                    'renderLabel': null,
                                                                    'renderHeader': null,
                                                                    'classNameCell': null
                                                                }, {
                                                                    'id': 'volume',
                                                                    'label': { 'name': 'Composite Volume:' },
                                                                    'classNameHeader': null,
                                                                    'classNameCellWrap': null,
                                                                    'renderCell': {
                                                                        '@class': 'org.openl.generated.beans.Input',
                                                                        'view': 'Input',
                                                                        'name': 'volume',
                                                                        'label': null,
                                                                        'type': 'number',
                                                                        'format': null,
                                                                        'disabled': null,
                                                                        'relativeData': null,
                                                                        'autoSubmit': null,
                                                                        'removable': null,
                                                                        'min': null,
                                                                        'className': 'border-on-hover',
                                                                        'compact': null,
                                                                        'placeholder': null,
                                                                        'validate': 'required',
                                                                        'verify': null,
                                                                        'icon': {
                                                                            '@class': 'org.openl.generated.beans.Text',
                                                                            'view': 'Text',
                                                                            'label': '$',
                                                                            'renderLabel': null,
                                                                            'children': null,
                                                                            'className': 'icon',
                                                                            'styles': null
                                                                        },
                                                                        'lefty': true,
                                                                        'onChange': null,
                                                                        'styles': null,
                                                                        'showIf': null,
                                                                        'style': {
                                                                            'minWidth': null,
                                                                            'marginTop': null,
                                                                            'verticalAlign': null,
                                                                            'borderColor': null,
                                                                            'width': '150px'
                                                                        },
                                                                        'renderCell': null,
                                                                        'outputFormat': {
                                                                            'decimals': 0,
                                                                            'percentage': null,
                                                                            'separateThousands': true
                                                                        }
                                                                    },
                                                                    'renderLabel': null,
                                                                    'renderHeader': null,
                                                                    'classNameCell': null
                                                                }],
                                                                'showIf': null,
                                                                'relativeData': true,
                                                                'renderItem': null,
                                                                'renderItemCells': null,
                                                                'vertical': true,
                                                                'renderExtraItem': null,
                                                                'itemsExpanded': null,
                                                                'colGroup': null
                                                            }],
                                                            'version': null,
                                                            'style': null
                                                        }, {
                                                            '@class': 'org.openl.generated.beans.Layout',
                                                            'view': 'VerticalLayout',
                                                            'name': null,
                                                            'styles': 'left margin-top-smaller',
                                                            'relativeData': null,
                                                            'showIf': {
                                                                'relativeData': null,
                                                                'name': 'payableRateTypeSelection',
                                                                'equal': 'Step'
                                                            },
                                                            'items': [{
                                                                '@class': 'org.openl.generated.beans.Table',
                                                                'view': 'Table',
                                                                'name': 'historicalAgeBandedRates',
                                                                'styles': 'full-width',
                                                                'headers': [{
                                                                    'id': 'ageBand',
                                                                    'label': { 'name': 'Age Band' },
                                                                    'classNameHeader': 'max-height',
                                                                    'classNameCellWrap': null,
                                                                    'renderCell': null,
                                                                    'renderLabel': null,
                                                                    'renderHeader': null,
                                                                    'classNameCell': null
                                                                }, {
                                                                    'id': 'rate',
                                                                    'label': { 'name': 'Rate' },
                                                                    'classNameHeader': 'max-height',
                                                                    'classNameCellWrap': null,
                                                                    'renderCell': {
                                                                        '@class': 'org.openl.generated.beans.Input',
                                                                        'view': 'Input',
                                                                        'name': 'rate',
                                                                        'label': null,
                                                                        'type': 'number',
                                                                        'format': null,
                                                                        'disabled': null,
                                                                        'relativeData': null,
                                                                        'autoSubmit': null,
                                                                        'removable': null,
                                                                        'min': null,
                                                                        'className': 'border-on-hover',
                                                                        'compact': null,
                                                                        'placeholder': null,
                                                                        'validate': 'required',
                                                                        'verify': null,
                                                                        'icon': {
                                                                            '@class': 'org.openl.generated.beans.Text',
                                                                            'view': 'Text',
                                                                            'label': '$',
                                                                            'renderLabel': null,
                                                                            'children': null,
                                                                            'className': 'icon',
                                                                            'styles': null
                                                                        },
                                                                        'lefty': true,
                                                                        'onChange': null,
                                                                        'styles': null,
                                                                        'showIf': null,
                                                                        'style': {
                                                                            'minWidth': null,
                                                                            'marginTop': null,
                                                                            'verticalAlign': null,
                                                                            'borderColor': null,
                                                                            'width': '150px'
                                                                        },
                                                                        'renderCell': null,
                                                                        'outputFormat': {
                                                                            'decimals': 3,
                                                                            'percentage': null,
                                                                            'separateThousands': null
                                                                        }
                                                                    },
                                                                    'renderLabel': null,
                                                                    'renderHeader': null,
                                                                    'classNameCell': null
                                                                }, {
                                                                    'id': 'volume',
                                                                    'label': { 'name': 'Volume' },
                                                                    'classNameHeader': 'max-height',
                                                                    'classNameCellWrap': null,
                                                                    'renderCell': {
                                                                        '@class': 'org.openl.generated.beans.Input',
                                                                        'view': 'Input',
                                                                        'name': 'volume',
                                                                        'label': null,
                                                                        'type': 'number',
                                                                        'format': null,
                                                                        'disabled': null,
                                                                        'relativeData': null,
                                                                        'autoSubmit': null,
                                                                        'removable': null,
                                                                        'min': null,
                                                                        'className': 'border-on-hover',
                                                                        'compact': null,
                                                                        'placeholder': null,
                                                                        'validate': 'required',
                                                                        'verify': null,
                                                                        'icon': {
                                                                            '@class': 'org.openl.generated.beans.Text',
                                                                            'view': 'Text',
                                                                            'label': '$',
                                                                            'renderLabel': null,
                                                                            'children': null,
                                                                            'className': 'icon',
                                                                            'styles': null
                                                                        },
                                                                        'lefty': true,
                                                                        'onChange': null,
                                                                        'styles': null,
                                                                        'showIf': null,
                                                                        'style': {
                                                                            'minWidth': null,
                                                                            'marginTop': null,
                                                                            'verticalAlign': null,
                                                                            'borderColor': null,
                                                                            'width': '150px'
                                                                        },
                                                                        'renderCell': null,
                                                                        'outputFormat': {
                                                                            'decimals': 0,
                                                                            'percentage': null,
                                                                            'separateThousands': true
                                                                        }
                                                                    },
                                                                    'renderLabel': null,
                                                                    'renderHeader': null,
                                                                    'classNameCell': null
                                                                }],
                                                                'showIf': null,
                                                                'relativeData': true,
                                                                'renderItem': null,
                                                                'renderItemCells': null,
                                                                'vertical': null,
                                                                'renderExtraItem': null,
                                                                'itemsExpanded': null,
                                                                'colGroup': null
                                                            }],
                                                            'version': null,
                                                            'style': null
                                                        }],
                                                        'version': null,
                                                        'style': null
                                                    }],
                                                    'version': null,
                                                    'style': null
                                                },
                                                'className': null,
                                                'styles': 'left justify margin wrap',
                                                'relativeData': true
                                            }],
                                            'version': null,
                                            'style': null
                                        }],
                                        'version': null,
                                        'style': null
                                    },
                                    'renderItemCells': null,
                                    'vertical': null,
                                    'renderExtraItem': null,
                                    'itemsExpanded': true,
                                    'colGroup': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        },
                        'renderItemCells': null,
                        'vertical': null,
                        'renderExtraItem': null,
                        'itemsExpanded': true,
                        'colGroup': null
                    }],
                    'version': null,
                    'style': null
                }
            }, {
                'view': 'Tab', 'tab': 'Experience Exhibit', 'content': {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'name': null,
                    'styles': null,
                    'relativeData': null,
                    'showIf': null,
                    'items': [{
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'bg-neutral padding-larger border',
                        'relativeData': null,
                        'showIf': {
                            'relativeData': null,
                            'name': 'experienceRatingOutputs.experienceByPeriod',
                            'equal': null
                        },
                        'items': [{
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': null,
                            'renderLabel': null,
                            'children': {
                                'name': 'experienceRatingOutputs.experienceExhibitHeader.header',
                                'relativeData': null,
                                'decimals': null
                            },
                            'className': 'h4 center padding-top',
                            'styles': null
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': null,
                            'renderLabel': null,
                            'children': {
                                'name': 'experienceRatingOutputs.experienceExhibitHeader.underwritingCompany',
                                'relativeData': null,
                                'decimals': null
                            },
                            'className': 'h6 center',
                            'styles': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'name': null,
                            'styles': 'center padding-top',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.TableRows',
                                'view': 'Table',
                                'styles': 'no-header border-bottom margin-right',
                                'headers': [{
                                    'id': 'Description',
                                    'label': 'Description',
                                    'styleHeader': { 'width': '0.6', 'minWidth': 'GeneralInfoLeftTableRows' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }, {
                                    'id': 'Value',
                                    'label': 'Value',
                                    'styleHeader': { 'width': '0.4', 'minWidth': 'GeneralInfoLeftTableRows' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }],
                                'extraItems': [{
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Policy Holder:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.policyHolder',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'String',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Policy / Quote Number:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.policyNumber',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'String',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Commissions:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.commissions',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'String',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'experienceRatingOutputs.experienceExhibitHeader.totalVolumeLabel' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.totalVolume',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Lives:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.lives',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Float',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Rate Guarantee Period (Months):' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.rateGuaranteePeriod',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Float',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }]
                            }, {
                                '@class': 'org.openl.generated.beans.TableRows',
                                'view': 'Table',
                                'styles': 'no-header border-bottom margin-right',
                                'headers': [{
                                    'id': 'Description',
                                    'label': 'Description',
                                    'styleHeader': { 'width': '0.6', 'minWidth': 'GeneralInfoRightTableRows' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }, {
                                    'id': 'Value',
                                    'label': 'Value',
                                    'styleHeader': { 'width': '0.4', 'minWidth': 'GeneralInfoRightTableRows' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }],
                                'extraItems': [{
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Policy Effective Date:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.policyEffectiveDate',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Date',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Rate Basis:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.rateBasis',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'String',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Inforce Rate:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.inforceRate',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 3,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Adjusted Manual Rate:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.adjustedManualRate',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 3,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Reported Formula Rate:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.reportedFormulaRate',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 3,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Experience Ratebook Name:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.experienceExhibitHeader.experienceRatebookName',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'String',
                                            'decimals': null,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }]
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Experience by Period',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'experienceRatingOutputs.experienceByPeriod',
                            'styles': null,
                            'headers': [{
                                'id': 'periodName',
                                'label': { 'name': 'Description' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': 'bold bg-info-light'
                            }, {
                                'id': 'startDate',
                                'label': { 'name': '1. Beginning of Period' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Date',
                                    'decimals': null
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'endDate',
                                'label': { 'name': '2. End of Period' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Date',
                                    'decimals': null
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'numberOfMonths',
                                'label': { 'name': '3. # of Months' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'coveredLives',
                                'label': { 'name': '4. Covered Lives' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'unadjustedWeight',
                                'label': { 'name': '5a. Unadjusted Weights' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'adjustedWeight',
                                'label': { 'name': '5b. Adjusted Weights' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'lifeYears',
                                'label': { 'name': '6. Life Years' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'lifeYearsForCredibility',
                                'label': { 'name': '6a. Life Years for Credibility' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'chargedRate',
                                'label': { 'name': '7. Charged Rate' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 3
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'paidPremium',
                                'label': { 'name': '8. Paid Premium' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'constantPremium',
                                'label': { 'name': '9. Constant Premium' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'annualizedConstantPremium',
                                'label': { 'name': '    Annualized Constant Premium' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'reservePct',
                                'label': { 'name': '    Reserve %' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'unadjustedWeightedConstantPremium',
                                'label': { 'name': '9a. Unadjusted Weighted Constant Premium' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'adjustedWeightedConstantPremium',
                                'label': { 'name': '9b. Adjusted Weighted Constant Premium' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'paidClaims',
                                'label': { 'name': 'experienceRatingOutputs.experienceByPeriod[0].paidClaimsLabel' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'paidClaimsAdjustment',
                                'label': { 'name': 'experienceRatingOutputs.experienceByPeriod[0].paidClaimsAdjustmentLabel' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'claimReserve',
                                'label': { 'name': 'experienceRatingOutputs.experienceByPeriod[0].claimReserveLabel' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'incurredClaims',
                                'label': { 'name': '13. Incurred Claims' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'unadjustedWeightedIncurredClaims',
                                'label': { 'name': '13a. Unadjusted Weighted Incurred Claims' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'adjustedWeightedIncurredClaims',
                                'label': { 'name': '13b. Adjusted Weighted Incurred Claims' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 0
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'lossRatio',
                                'label': { 'name': '14. Loss Ratio' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }],
                            'showIf': null,
                            'relativeData': false,
                            'renderItem': null,
                            'renderItemCells': null,
                            'vertical': true,
                            'renderExtraItem': null,
                            'itemsExpanded': null,
                            'colGroup': [{
                                'isFixed': true,
                                'style': {
                                    'minWidth': null,
                                    'marginTop': null,
                                    'verticalAlign': null,
                                    'borderColor': null,
                                    'width': '700px'
                                }
                            }]
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Experience Summary',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'experienceRatingOutputs.experienceSummary',
                            'styles': null,
                            'headers': [{
                                'id': 'summaryType',
                                'label': { 'name': 'Description' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': 'bold bg-info-light'
                            }, {
                                'id': 'weightedLossRatio',
                                'label': { 'name': '15. Weighted Loss Ratio: (Line 13ab / Line 9ab)' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'permissibleLossRatio',
                                'label': { 'name': '16. Permissible Loss Ratio' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'ficaAdjustmentFactor',
                                'label': { 'name': '17. FICA Adjustment Factor' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Float',
                                    'decimals': 2
                                },
                                'renderLabel': { 'name': null, 'decimals': 2 },
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'rateGuaranteePeriodFactor',
                                'label': { 'name': '18. Rate Guarantee Period Factor' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'credibilityFactor',
                                'label': { 'name': '19. Credibility Factor: (Line 6a - 30)/500' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'planChangeAdjustment',
                                'label': { 'name': '20. Plan Change Adjustment' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Float',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'matrixClaimAdminFactor',
                                'label': { 'name': '21. Matrix Claim Admin Factor' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Float',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'cashsicknessOffsetAdjustment',
                                'label': { 'name': '22. Cashsickness Offset Adjustment' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Float',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'adjustedManualRate',
                                'label': { 'name': '23. Adjusted Manual Rate (adjusted for BTM and BTF margins)' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 3
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }],
                            'showIf': null,
                            'relativeData': null,
                            'renderItem': null,
                            'renderItemCells': null,
                            'vertical': true,
                            'renderExtraItem': null,
                            'itemsExpanded': null,
                            'colGroup': [{
                                'isFixed': true,
                                'style': {
                                    'minWidth': null,
                                    'marginTop': null,
                                    'verticalAlign': null,
                                    'borderColor': null,
                                    'width': '700px'
                                }
                            }]
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Rate Summary',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'experienceRatingOutputs.experienceSummary',
                            'styles': null,
                            'headers': [{
                                'id': 'summaryType',
                                'label': { 'name': 'Description' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': 'bold bg-info-light'
                            }, {
                                'id': 'uncappedExperienceRate',
                                'label': { 'name': '24. Uncapped Experience Rate: Line 15 / Line 16 x Line 17 x Line 18 x Line 20 x Line 22 x In Force Rate' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 3
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'cappedExperienceRateForFloorCeiling',
                                'label': { 'name': '25. Capped Experience Rate for Floor/Ceiling' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 3
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'riskBasedUWAdjustment',
                                'label': { 'name': '26. Risk Based UW Adjustment' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'subsidyAdjustment',
                                'label': { 'name': '27. Subsidy Adjustment' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'blendedRate',
                                'label': { 'name': '28. Blended Rate: [(Line 25 x Line 19) + (Line 23 x (1 - Line 19))] x Line 21 x (1 + Line 26 + Line 27)' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Currency',
                                    'decimals': 3
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }],
                            'showIf': null,
                            'relativeData': null,
                            'renderItem': null,
                            'renderItemCells': null,
                            'vertical': true,
                            'renderExtraItem': null,
                            'itemsExpanded': null,
                            'colGroup': [{
                                'isFixed': true,
                                'style': {
                                    'minWidth': null,
                                    'marginTop': null,
                                    'verticalAlign': null,
                                    'borderColor': null,
                                    'width': '700px'
                                }
                            }]
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Cashsickness Adjustment Factors By Period',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'experienceRatingOutputs.totalCashsicknessAdjustmentsByPeriod',
                            'styles': null,
                            'headers': [{
                                'id': 'periodName',
                                'label': { 'name': 'Description' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': null,
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': 'bold bg-info-light'
                            }, {
                                'id': 'totalAdjustmentWithDefaultWeightsAndCalculatedFactors',
                                'label': { 'name': 'Unadjusted - Default Weights and Calculated Factors' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }, {
                                'id': 'totalAdjustmentWithAdjustedWeightsAndOverriddenFactors',
                                'label': { 'name': 'Adjusted - Adjusted Weights and CS Overrides' },
                                'classNameHeader': null,
                                'classNameCellWrap': null,
                                'renderCell': {
                                    '@class': 'org.openl.generated.beans.RenderCell',
                                    'name': 'Percent',
                                    'decimals': 2
                                },
                                'renderLabel': null,
                                'renderHeader': null,
                                'classNameCell': null
                            }],
                            'showIf': null,
                            'relativeData': null,
                            'renderItem': null,
                            'renderItemCells': null,
                            'vertical': true,
                            'renderExtraItem': null,
                            'itemsExpanded': null,
                            'colGroup': [{
                                'isFixed': true,
                                'style': {
                                    'minWidth': null,
                                    'marginTop': null,
                                    'verticalAlign': null,
                                    'borderColor': null,
                                    'width': '700px'
                                }
                            }]
                        }, {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Final Summary',
                            'renderLabel': null,
                            'children': null,
                            'className': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'left',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.TableRows',
                                'view': 'Table',
                                'styles': 'no-header bold',
                                'headers': [{
                                    'id': 'Description',
                                    'label': 'Description',
                                    'styleHeader': { 'width': '0.8', 'minWidth': 'Summary' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }, {
                                    'id': 'Value',
                                    'label': 'Value',
                                    'styleHeader': { 'width': '0.2', 'minWidth': 'Summary' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null
                                }],
                                'extraItems': [{
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Reported Formula Rate:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.reportedFormulaRate',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 3,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Monthly Blended Premium:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.monthlyBlendedPremium',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Annual Blended Premium:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.annualBlendedPremium',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Estimated BTF:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.estimatedBTF',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Percent',
                                            'decimals': 0,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Reported Monthly Premium per Life:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.reportedMonthlyPremiumPerLife',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Currency',
                                            'decimals': 2,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }, {
                                    '@class': 'org.openl.generated.beans.TableRowsItems',
                                    'Description': { 'name': 'Formula to Manual Ratio:' },
                                    'Value': {
                                        'view': 'Text',
                                        'label': {
                                            'name': 'experienceRatingOutputs.rateSummary.formulaToInforceManualOrPresetSlopeRatio',
                                            'relativeData': null
                                        },
                                        'renderLabel': {
                                            'name': 'Float',
                                            'decimals': 5,
                                            'truncated': null,
                                            'faded': null,
                                            'view': null,
                                            'index': null,
                                            'onClick': null
                                        }
                                    },
                                    'renderCell': null
                                }]
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-top-larger',
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingOutputs.uwOverrideReasons',
                                'equal': null
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Override Reasons',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'h6 padding-v-smaller'
                            }, {
                                '@class': 'org.openl.generated.beans.Table',
                                'view': 'Table',
                                'name': 'experienceRatingOutputs.uwOverrideReasons',
                                'styles': null,
                                'headers': [{
                                    'id': 'overrideName',
                                    'label': { 'name': 'Override Name' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'overrideReason',
                                    'label': { 'name': 'Override Reason' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }],
                                'showIf': null,
                                'relativeData': null,
                                'renderItem': null,
                                'renderItemCells': null,
                                'vertical': null,
                                'renderExtraItem': null,
                                'itemsExpanded': null,
                                'colGroup': [{
                                    'isFixed': true,
                                    'style': {
                                        'minWidth': null,
                                        'marginTop': null,
                                        'verticalAlign': null,
                                        'borderColor': null,
                                        'width': '500px'
                                    }
                                }]
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-top-larger',
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingOutputs.comments',
                                'equal': null
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Comments',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'h6 padding-v-smaller'
                            }, {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': null,
                                'renderLabel': null,
                                'children': {
                                    'name': 'experienceRatingOutputs.comments',
                                    'relativeData': null,
                                    'decimals': null
                                },
                                'className': null,
                                'styles': null
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }],
                    'version': null,
                    'style': null
                }
            }, {
                'view': 'Tab', 'tab': 'Underwriting Overrides', 'content': {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'name': null,
                    'styles': null,
                    'relativeData': null,
                    'showIf': null,
                    'items': [{
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'name': null,
                        'styles': 'bg-neutral padding-larger border',
                        'relativeData': null,
                        'showIf': {
                            'relativeData': null,
                            'name': 'experienceRatingOutputs.experienceByPeriod',
                            'equal': null
                        },
                        'items': [{
                            '@class': 'org.openl.generated.beans.Title',
                            'view': 'Title',
                            'label': 'Underwriting Overrides',
                            'renderLabel': null,
                            'styles': 'h6 padding-v-smaller'
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'wrap margin-bottom-smaller width-100p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Inforce Rate:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.inforceRate',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 3, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Inforce Rate Override:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.inforceRateOverride',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 3, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'HorizontalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': { 'name': 'popupOpen', 'args': ['InforceRateOverrideReason'] },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'InforceRateOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Inforce Rate Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'By default, the experience rating will use the composite rate, across all plans/coverages, from the current experience period. If you wish to override this value, please provide a reason for your override.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.inforceRateOverride',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': {
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': '$',
                                                        'renderLabel': null,
                                                        'children': null,
                                                        'className': 'icon',
                                                        'styles': null
                                                    },
                                                    'lefty': true,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 3,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.inforceRateOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Total Core Volume:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.totalCoreVolume',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 0, 'percentage': null, 'separateThousands': true }
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Total Core Volume Override:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.totalCoreVolumeOverride',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 0, 'percentage': null, 'separateThousands': true }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'HorizontalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['TotalCoreVolumeOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'TotalCoreVolumeOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Total Core Volume Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'By default, the experience rating will use the total core volume calculated in manual rating. If you wish to override this value, please provide a reason for your override.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.totalCoreVolumeOverride',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': {
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': '$',
                                                        'renderLabel': null,
                                                        'children': null,
                                                        'className': 'icon',
                                                        'styles': null
                                                    },
                                                    'lefty': true,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 0,
                                                        'percentage': null,
                                                        'separateThousands': true
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.totalCoreVolumeOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': 'experienceRatingInputs.uwOverrides',
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Ignore Floor/Ceiling?',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Select',
                                        'view': 'Select',
                                        'name': 'ignoreFloorAndCeilingSelection',
                                        'options': {
                                            'name': 'ignoreFloorAndCeilingList',
                                            'relativeData': null,
                                            'decimals': null
                                        },
                                        'mapOptions': {
                                            'text': 'ignoreFloorAndCeiling',
                                            'value': 'ignoreFloorAndCeiling'
                                        },
                                        'styles': 'middle fill-width right',
                                        'disabled': true,
                                        'validate': null,
                                        'compact': true,
                                        'value': null,
                                        'upward': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['IgnoreFloorAndCeilingOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'IgnoreFloorAndCeilingOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Ignore Floor and Ceiling Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Set this to “Yes” if you wish to allow the experience rate to be less than 50% or more than 200% of the manual rate. Please provide a reason if you ignore the floor/ceiling.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Layout',
                                                    'view': 'HorizontalLayout',
                                                    'name': null,
                                                    'styles': 'width-25p',
                                                    'relativeData': null,
                                                    'showIf': null,
                                                    'items': [{
                                                        '@class': 'org.openl.generated.beans.Select',
                                                        'view': 'Select',
                                                        'name': 'ignoreFloorAndCeilingSelection',
                                                        'options': {
                                                            'name': 'ignoreFloorAndCeilingList',
                                                            'relativeData': null,
                                                            'decimals': null
                                                        },
                                                        'mapOptions': {
                                                            'text': 'ignoreFloorAndCeiling',
                                                            'value': 'ignoreFloorAndCeiling'
                                                        },
                                                        'styles': 'padding-v width-50p',
                                                        'disabled': null,
                                                        'validate': null,
                                                        'compact': true,
                                                        'value': null,
                                                        'upward': null
                                                    }],
                                                    'version': null,
                                                    'style': null
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'ignoreFloorAndCeilingOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Plan Change Adjustment Factor:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.planChangeAdjustment',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 2, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['PlanChangeAdjustmentOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'PlanChangeAdjustmentOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Plan Change Adjustment Factor Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'In the event that the customer’s inforce plan design differs from the proposed future plan design, please run the manual rates using both plan designs and determine the proposed-to-inforce rate relativity, then enter that value here. Please also provide a comment and indicate which plan design features will differ.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.planChangeAdjustment',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 2,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.planChangeAdjustmentOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Matrix Load Percentage:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.matrixLoad',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': false,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 2, 'percentage': true, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Matrix Load Factor Override:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.matrixLoadFactorOverride',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 4, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['MatrixLoadFactorOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'MatrixLoadFactorOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Matrix Load Factor Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'The calculated Matrix Load is displayed in the box above. If you wish to use a different value, please enter the factor that should be used here. A 5% load should be entered in the form 1.05 (not 5%). Please also provide a reason for your override.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.matrixLoadFactorOverride',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 4,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.matrixLoadFactorOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Manual Rate:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.manualRate',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 3, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Manual Rate Override:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.manualRateOverride',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 3, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': { 'name': 'popupOpen', 'args': ['ManualRateOverrideReason'] },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'ManualRateOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Manual Rate Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'By default, the experience rating will use the composite rate calculated in manual rating. If you wish to override this value, please provide a reason for your override. Enter your manual rate override on the BTM rate basis.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.manualRateOverride',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': {
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': '$',
                                                        'renderLabel': null,
                                                        'children': null,
                                                        'className': 'icon',
                                                        'styles': null
                                                    },
                                                    'lefty': true,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 3,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.manualRateOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Subsidy Adjustment Percentage:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.manualRatingSubsidyAdjustment',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 2, 'percentage': true, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Risk-based UW Adjustment Percentage:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.riskBasedUWAdjustment',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': null,
                                        'lefty': null,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 2, 'percentage': true, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['RiskBasedUWAdjustmentOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'RiskBasedUWAdjustmentOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Risk Based UW Adjustment Percentage Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Please enter any risk-based Underwriting Adjustment that you would like to be applied to the blended rate. Please briefly explain the reason for this adjustment.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.riskBasedUWAdjustment',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 2,
                                                        'percentage': true,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.riskBasedUWAdjustmentOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': 'no-padding no-margin width-50p',
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'middle padding-left-smallest no-margin width-50p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Text',
                                        'view': 'Text',
                                        'label': 'Reported Formula Rate Override:',
                                        'renderLabel': null,
                                        'children': null,
                                        'className': null,
                                        'styles': null
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Input',
                                        'view': 'Input',
                                        'name': 'experienceRatingInputs.uwOverrides.reportedFormulaRateOverride',
                                        'label': null,
                                        'type': 'number',
                                        'format': null,
                                        'disabled': true,
                                        'relativeData': null,
                                        'autoSubmit': null,
                                        'removable': null,
                                        'min': null,
                                        'className': 'max-width-290 margin',
                                        'compact': null,
                                        'placeholder': null,
                                        'validate': null,
                                        'verify': null,
                                        'icon': {
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': '$',
                                            'renderLabel': null,
                                            'children': null,
                                            'className': 'icon',
                                            'styles': null
                                        },
                                        'lefty': true,
                                        'onChange': null,
                                        'styles': 'middle fill-width',
                                        'showIf': null,
                                        'style': null,
                                        'renderCell': null,
                                        'outputFormat': { 'decimals': 3, 'percentage': null, 'separateThousands': null }
                                    }],
                                    'version': null,
                                    'style': null
                                }, {
                                    '@class': 'org.openl.generated.beans.Layout',
                                    'view': 'VerticalLayout',
                                    'name': null,
                                    'styles': 'padding-smallest no-margin width-25p',
                                    'relativeData': null,
                                    'showIf': null,
                                    'items': [{
                                        '@class': 'org.openl.generated.beans.Col',
                                        'view': 'Col',
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Button',
                                            'view': 'Button',
                                            'styles': 'margin-left',
                                            'style': {
                                                'minWidth': null,
                                                'marginTop': null,
                                                'verticalAlign': null,
                                                'borderColor': null,
                                                'width': '100px'
                                            },
                                            'items': null,
                                            'onClick': {
                                                'name': 'popupOpen',
                                                'args': ['ReportedFormulaRateOverrideReason']
                                            },
                                            'children': 'Override',
                                            'disabled': null
                                        }, {
                                            '@class': 'org.openl.generated.beans.Popup',
                                            'view': 'Popup',
                                            'id': 'ReportedFormulaRateOverrideReason',
                                            'items': [{
                                                '@class': 'org.openl.generated.beans.Layout',
                                                'view': 'VerticalLayout',
                                                'name': null,
                                                'styles': null,
                                                'relativeData': null,
                                                'showIf': null,
                                                'items': [{
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Reported Formula Rate Override',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'bold padding-bottom'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'The Adjusted Blended Rate will be the Reported Formula Rate for BTF purposes. If you do not wish to use this rate generated by the model, please enter the rate you would like to use as the Reported Formula Rate. Please provide a reason for any override.',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-smallest no-padding-left padding-v'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.reportedFormulaRateOverride',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'max-width-290 margin',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': {
                                                        '@class': 'org.openl.generated.beans.Text',
                                                        'view': 'Text',
                                                        'label': '$',
                                                        'renderLabel': null,
                                                        'children': null,
                                                        'className': 'icon',
                                                        'styles': null
                                                    },
                                                    'lefty': true,
                                                    'onChange': null,
                                                    'styles': 'padding-v',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 3,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Text',
                                                    'view': 'Text',
                                                    'label': 'Override Reason',
                                                    'renderLabel': null,
                                                    'children': null,
                                                    'className': null,
                                                    'styles': 'padding-v bold'
                                                }, {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'experienceRatingInputs.uwOverrides.reportedFormulaRateOverrideReason',
                                                    'label': null,
                                                    'type': 'text',
                                                    'format': null,
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': null,
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': 'full-width',
                                                    'showIf': null,
                                                    'style': null,
                                                    'renderCell': null,
                                                    'outputFormat': null
                                                }],
                                                'version': null,
                                                'style': null
                                            }]
                                        }]
                                    }],
                                    'version': null,
                                    'style': null
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-top-larger',
                            'relativeData': null,
                            'showIf': {
                                'relativeData': null,
                                'name': 'experienceRatingOutputs.uwOverrideReasons',
                                'equal': null
                            },
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Override Reasons',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'h6 padding-v-smaller'
                            }, {
                                '@class': 'org.openl.generated.beans.Table',
                                'view': 'Table',
                                'name': 'experienceRatingOutputs.uwOverrideReasons',
                                'styles': null,
                                'headers': [{
                                    'id': 'overrideName',
                                    'label': { 'name': 'Override Name' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }, {
                                    'id': 'overrideReason',
                                    'label': { 'name': 'Override Reason' },
                                    'classNameHeader': null,
                                    'classNameCellWrap': null,
                                    'renderCell': null,
                                    'renderLabel': null,
                                    'renderHeader': null,
                                    'classNameCell': null
                                }],
                                'showIf': null,
                                'relativeData': null,
                                'renderItem': null,
                                'renderItemCells': null,
                                'vertical': null,
                                'renderExtraItem': null,
                                'itemsExpanded': null,
                                'colGroup': [{
                                    'isFixed': true,
                                    'style': {
                                        'minWidth': null,
                                        'marginTop': null,
                                        'verticalAlign': null,
                                        'borderColor': null,
                                        'width': '500px'
                                    }
                                }]
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Element',
                            'view': 'Space'
                        }, { '@class': 'org.openl.generated.beans.Element', 'view': 'Space' }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'wrap margin-bottom-smaller padding-top width-100p',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Cashsickness Offset Adjustment Factors',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'h6 padding-top padding-bottom-smaller'
                            }, {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'HorizontalLayout',
                                'name': null,
                                'styles': null,
                                'relativeData': null,
                                'showIf': null,
                                'items': [{
                                    '@class': 'org.openl.generated.beans.RowList',
                                    'view': 'RowList',
                                    'name': 'experienceRatingInputs.uwOverrides.cashsicknessAdjustmentsByPeriod',
                                    'renderItem': {
                                        'view': 'VerticalLayout',
                                        'name': null,
                                        'styles': 'left padding-bottom margin-right-largest',
                                        'relativeData': null,
                                        'showIf': null,
                                        'items': [{
                                            '@class': 'org.openl.generated.beans.Text',
                                            'view': 'Text',
                                            'label': null,
                                            'renderLabel': null,
                                            'children': {
                                                'name': 'periodName',
                                                'relativeData': null,
                                                'decimals': null
                                            },
                                            'className': null,
                                            'styles': 'padding-v bold'
                                        }, {
                                            '@class': 'org.openl.generated.beans.Table',
                                            'view': 'Table',
                                            'name': 'cashsicknessAdjustmentsByState',
                                            'styles': 'left',
                                            'headers': [{
                                                'id': 'stateName',
                                                'label': { 'name': 'State' },
                                                'classNameHeader': null,
                                                'classNameCellWrap': null,
                                                'renderCell': null,
                                                'renderLabel': null,
                                                'renderHeader': null,
                                                'classNameCell': null
                                            }, {
                                                'id': 'calculatedCSOAdjustmentFactor',
                                                'label': { 'name': 'Calculated' },
                                                'classNameHeader': null,
                                                'classNameCellWrap': null,
                                                'renderCell': {
                                                    '@class': 'org.openl.generated.beans.RenderCell',
                                                    'name': 'Float',
                                                    'decimals': 4
                                                },
                                                'renderLabel': null,
                                                'renderHeader': null,
                                                'classNameCell': null
                                            }, {
                                                'id': 'overriddenCSOAdjustmentFactor',
                                                'label': { 'name': 'Overridden' },
                                                'classNameHeader': null,
                                                'classNameCellWrap': null,
                                                'renderCell': {
                                                    '@class': 'org.openl.generated.beans.Input',
                                                    'view': 'Input',
                                                    'name': 'overriddenCSOAdjustmentFactor',
                                                    'label': null,
                                                    'type': 'number',
                                                    'format': 'double_5',
                                                    'disabled': null,
                                                    'relativeData': null,
                                                    'autoSubmit': null,
                                                    'removable': null,
                                                    'min': null,
                                                    'className': 'border-on-hover',
                                                    'compact': null,
                                                    'placeholder': null,
                                                    'validate': null,
                                                    'verify': null,
                                                    'icon': null,
                                                    'lefty': null,
                                                    'onChange': null,
                                                    'styles': null,
                                                    'showIf': null,
                                                    'style': {
                                                        'minWidth': null,
                                                        'marginTop': null,
                                                        'verticalAlign': null,
                                                        'borderColor': null,
                                                        'width': '100px'
                                                    },
                                                    'renderCell': null,
                                                    'outputFormat': {
                                                        'decimals': 4,
                                                        'percentage': null,
                                                        'separateThousands': null
                                                    }
                                                },
                                                'renderLabel': null,
                                                'renderHeader': null,
                                                'classNameCell': null
                                            }],
                                            'showIf': null,
                                            'relativeData': null,
                                            'renderItem': null,
                                            'renderItemCells': null,
                                            'vertical': null,
                                            'renderExtraItem': null,
                                            'itemsExpanded': null,
                                            'colGroup': null
                                        }],
                                        'version': null,
                                        'style': null
                                    },
                                    'className': null,
                                    'styles': 'left justify wrap',
                                    'relativeData': true
                                }],
                                'version': null,
                                'style': null
                            }],
                            'version': null,
                            'style': null
                        }, {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'name': null,
                            'styles': 'padding-top-larger',
                            'relativeData': null,
                            'showIf': null,
                            'items': [{
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Comments',
                                'renderLabel': null,
                                'children': null,
                                'className': null,
                                'styles': 'h6 padding-v-smaller'
                            }, {
                                '@class': 'org.openl.generated.beans.Input',
                                'view': 'Input',
                                'name': 'experienceRatingInputs.uwOverrides.comments',
                                'label': null,
                                'type': 'textarea',
                                'format': null,
                                'disabled': null,
                                'relativeData': null,
                                'autoSubmit': null,
                                'removable': null,
                                'min': null,
                                'className': null,
                                'compact': null,
                                'placeholder': null,
                                'validate': null,
                                'verify': null,
                                'icon': null,
                                'lefty': null,
                                'onChange': null,
                                'styles': 'full-width',
                                'showIf': null,
                                'style': null,
                                'renderCell': null,
                                'outputFormat': null
                            }],
                            'version': null,
                            'style': null
                        }],
                        'version': null,
                        'style': null
                    }],
                    'version': null,
                    'style': null
                }
            }], 'styles': 'padding', 'buttoned': null
        }],
        'version': null,
        'style': null
    }],
    'version': null,
    'style': null
}