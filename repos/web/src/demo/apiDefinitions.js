export default {
  AccountBillingType: {
    properties: {
      billingTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ActionMetadata: {
    properties: {
      available: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  ActionMetadataDTO: {
    properties: {
      available: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  ActivityMessage: {
    properties: {
      category: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      performer: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AddressDetails: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressTypeCd: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      latitude: {
        type: 'string',
      },
      longitude: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Agency: {
    properties: {
      agencyCode: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgencyAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgencySummary: {
    properties: {
      address: {
        $ref: 'AgencyAddress',
      },
      channelCd: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      locationTypeCd: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      primaryInd: {
        type: 'boolean',
      },
      status: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAdjustmentBatchRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAdjustmentBatchResponse: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      completionDate: {
        format: 'date',
        readOnly: true,
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAdjustmentBatchSummary: {
    properties: {
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAgencyBill: {
    properties: {
      amount: {
        type: 'number',
      },
      balanceDue: {
        $ref: 'AgentMoney',
      },
      brokerCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      invoiceNumber: {
        type: 'string',
      },
      maxCommissionToRetain: {
        $ref: 'AgentMoney',
      },
      minimumDue: {
        $ref: 'AgentMoney',
      },
      pastDue: {
        $ref: 'AgentMoney',
      },
      totalPaid: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentAgencyBillPolicy: {
    properties: {
      balanceDue: {
        $ref: 'AgentMoney',
      },
      billingAccountName: {
        type: 'string',
      },
      billingAccountNumber: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      dueDay: {
        format: 'int',
        type: 'integer',
      },
      dueDayConfiguration: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      grossMinimumDue: {
        $ref: 'AgentMoney',
      },
      minimumDue: {
        $ref: 'AgentMoney',
      },
      netMinimumDue: {
        $ref: 'AgentMoney',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusDisplayCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAgencyPaymentRequest: {
    properties: {
      agencyBillId: {
        format: 'int',
        type: 'integer',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentDetails: {
        $ref: 'PaymentDetailsDTO',
        description: 'Payment Method Details',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      producerCd: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAgencyPaymentResponse: {
    properties: {
      agencyBill: {
        $ref: 'AgentAgencyBill',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentDetails: {
        $ref: 'PaymentDetailsDTO',
        description: 'Payment Method Details',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      producerCd: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAgencyPaymentSummary: {
    properties: {
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAgencyPaymentsSummary: {
    properties: {
      allocatedAmount: {
        $ref: 'AgentMoney',
      },
      paymentsAmount: {
        $ref: 'AgentMoney',
      },
      paymentsCount: {
        format: 'int',
        type: 'integer',
      },
      suspendedAmount: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentAlertCreateRequest: {
    properties: {
      alert: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAlertSummary: {
    properties: {
      alert: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      created: {
        format: 'date-time',
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      performerId: {
        type: 'string',
      },
      updated: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAlertUpdateRequest: {
    properties: {
      alert: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAnonymousCustomerRequest: {
    properties: {
      anonymous: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentAuthorityLevel: {
    properties: {
      level: {
        type: 'string',
      },
      product: {
        type: 'string',
      },
      subType: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAutomaticRefundPaymentMethod: {
    properties: {
      allowDifferentMethods: {
        type: 'boolean',
      },
      defaultRefundMethod: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAvailablePaymentPlanRequest: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      billType: {
        type: 'string',
      },
      billablePolicyTerm: {
        $ref: 'AgentBillablePolicyTermDetails',
      },
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      paymentPlanCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      recurringInd: {
        type: 'boolean',
      },
      stateCd: {
        type: 'string',
      },
      txTypeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentAvailablePaymentPlanResponse: {
    properties: {
      availablePaymentPlans: {
        items: {
          $ref: 'AgentPaymentPlanSummary',
        },
        type: 'array',
      },
      defaultPaymentPlan: {
        $ref: 'AgentPaymentPlanSummary',
      },
      paymentPlanDisabled: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentBackOfficeBillingAccountSummary: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      balanceDue: {
        $ref: 'AgentMoney',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      dueDay: {
        type: 'string',
      },
      minimumDue: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentBackOfficePolicy: {
    properties: {
      balanceDue: {
        $ref: 'AgentMoney',
      },
      billingAccountName: {
        type: 'string',
      },
      billingAccountNumber: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      dueDay: {
        format: 'int',
        type: 'integer',
      },
      dueDayConfiguration: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      minimumDue: {
        $ref: 'AgentMoney',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusDisplayCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBasicAuthorityLevel: {
    properties: {
      level: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBatchPaymentRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      postDatedCheck: {
        type: 'boolean',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
      underwriterCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBatchPaymentResponse: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      blobCd: {
        enum: ['personalAndCommercialBroadLine'],
        type: 'string',
      },
      completionDate: {
        format: 'date',
        readOnly: true,
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      postDatedCheck: {
        type: 'boolean',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
      underwriterCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBatchPaymentSummary: {
    properties: {
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBatchPaymentsSummary: {
    properties: {
      completeAmount: {
        $ref: 'AgentMoney',
      },
      completeCount: {
        format: 'int',
        type: 'integer',
      },
      incompleteAmount: {
        $ref: 'AgentMoney',
      },
      incompleteCount: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentBenefitsAmountOptions: {
    properties: {
      amount: {
        type: 'number',
      },
      benefitMaxAmount: {
        type: 'number',
      },
      benefitMinAmount: {
        type: 'number',
      },
      childBenefitAmountOptions: {
        $ref: 'AgentBenefitsAmountOptions',
      },
      fixedBenefitValueSet: {
        items: {
          type: 'number',
        },
        type: 'array',
      },
      fixedBenefitValues: {
        items: {
          type: 'number',
        },
        type: 'array',
      },
      increment: {
        type: 'number',
      },
      maxAmount: {
        type: 'number',
      },
      maxPercentage: {
        type: 'number',
      },
      maxSalaryMultiplier: {
        format: 'int',
        type: 'integer',
      },
      memberBenefitAmountOptions: {
        $ref: 'AgentBenefitsAmountOptions',
      },
      minAmount: {
        type: 'number',
      },
      minPercentage: {
        type: 'number',
      },
      minSalaryMultiplier: {
        format: 'int',
        type: 'integer',
      },
      percentIncrement: {
        type: 'number',
      },
      salaryMultiplier: {
        format: 'int',
        type: 'integer',
      },
      salaryMultipliers: {
        items: {
          format: 'int32',
          type: 'integer',
        },
        type: 'array',
      },
      salaryPercentage: {
        type: 'number',
      },
      salaryPercentages: {
        items: {
          type: 'number',
        },
        type: 'array',
      },
      spouseBenefitAmountOptions: {
        $ref: 'AgentBenefitsAmountOptions',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsBillingPayment: {
    properties: {
      paymentAllocations: {
        items: {
          $ref: 'AgentBillingPaymentAllocation',
        },
        type: 'array',
      },
      paymentAmount: {
        type: 'number',
      },
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsCertificatePolicy: {
    properties: {
      anniversaryDate: {
        type: 'string',
      },
      cancellationDate: {
        type: 'string',
      },
      currentRevisionInd: {
        type: 'boolean',
      },
      customerNumber: {
        type: 'string',
      },
      effectiveDate: {
        type: 'string',
      },
      expirationDate: {
        type: 'string',
      },
      issueCountry: {
        type: 'string',
      },
      issueState: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      primaryParticipantName: {
        type: 'string',
      },
      primaryParticipantTaxId: {
        type: 'string',
      },
      renewalDate: {
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      transactionEffectiveDate: {
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsCertificatePolicySummary: {
    properties: {
      certificateDtoList: {
        items: {
          $ref: 'AgentBenefitsCertificatePolicy',
        },
        type: 'array',
      },
      masterPolicyEffectiveDate: {
        type: 'string',
      },
      masterPolicyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsClassificationGroupCoverageRelationship: {
    properties: {
      amountOptions: {
        $ref: 'AgentBenefitsAmountOptions',
      },
      classificationGroupCode: {
        type: 'string',
      },
      classificationGroupName: {
        type: 'string',
      },
      classificationGroupOid: {
        type: 'string',
      },
      classificationSubgroupRatings: {
        items: {
          $ref: 'AgentBenefitsRatingInfo',
        },
        type: 'array',
      },
      customizeCoverage: {
        type: 'boolean',
      },
      rate: {
        type: 'number',
      },
      useSubgroups: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterCoverage: {
    properties: {
      amountOptions: {
        $ref: 'AgentBenefitsAmountOptions',
      },
      benefitType: {
        type: 'string',
      },
      classificationGroupCoverageRelationships: {
        items: {
          $ref: 'AgentBenefitsClassificationGroupCoverageRelationship',
        },
        type: 'array',
      },
      contributionType: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      directBilled: {
        type: 'boolean',
      },
      memberPaymentModes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      minParticipantCount: {
        format: 'int',
        type: 'integer',
      },
      oid: {
        type: 'string',
      },
      participantContributionPercentage: {
        type: 'number',
      },
      planCd: {
        type: 'string',
      },
      rateBasisCd: {
        type: 'string',
      },
      rateGuarantee: {
        format: 'int',
        type: 'integer',
      },
      requiredParticipationPercentage: {
        type: 'number',
      },
      selfAdministered: {
        type: 'boolean',
      },
      sponsorPaymentMode: {
        type: 'string',
      },
      taxability: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPolicy: {
    properties: {
      anniversaryDate: {
        format: 'date',
        type: 'string',
      },
      cancellationDate: {
        format: 'date',
        type: 'string',
      },
      currentRevisionInd: {
        type: 'boolean',
      },
      customerNumber: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      issueDate: {
        format: 'date',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      productCode: {
        type: 'string',
      },
      productVersion: {
        format: 'int',
        type: 'integer',
      },
      revisionNumber: {
        format: 'int',
        type: 'integer',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date',
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPolicyDetail: {
    properties: {
      anniversaryDate: {
        format: 'date',
        type: 'string',
      },
      cancellationDate: {
        format: 'date',
        type: 'string',
      },
      coverages: {
        items: {
          $ref: 'AgentBenefitsMasterCoverage',
        },
        type: 'array',
      },
      currentRevisionInd: {
        type: 'boolean',
      },
      customerNumber: {
        type: 'string',
      },
      deliveryModelCd: {
        type: 'string',
      },
      durationInMonths: {
        format: 'int',
        type: 'integer',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      issueDate: {
        format: 'date',
        type: 'string',
      },
      maxNumberOfParticipants: {
        format: 'int',
        type: 'integer',
      },
      minNumberOfParticipants: {
        format: 'int',
        type: 'integer',
      },
      minParticipationPercentage: {
        format: 'int',
        type: 'integer',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      premiums: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummary',
        },
        type: 'array',
      },
      priorCarrierName: {
        type: 'string',
      },
      priorCarrierPolicyNumber: {
        type: 'string',
      },
      priorClaimsAllowed: {
        type: 'boolean',
      },
      priorClaimsRetroactiveEffectiveDate: {
        type: 'string',
      },
      producerCd: {
        type: 'string',
      },
      productCode: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      quoteCreationDate: {
        format: 'date',
        type: 'string',
      },
      quoteExpirationDate: {
        format: 'date',
        type: 'string',
      },
      renewalFrequency: {
        type: 'string',
      },
      revisionNumber: {
        type: 'string',
      },
      shortTermInd: {
        type: 'boolean',
      },
      situsState: {
        type: 'string',
      },
      subProducerCd: {
        type: 'string',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date',
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPremiumSummary: {
    properties: {
      annualPremium: {
        type: 'number',
      },
      byPayor: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummaryAggregatedByPayor',
        },
        type: 'array',
      },
      contributionType: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      numberOfParticipants: {
        type: 'number',
      },
      planCd: {
        type: 'string',
      },
      volume: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPremiumSummaryAggregatedByGroup: {
    properties: {
      annualPremium: {
        type: 'number',
      },
      byClassificationGroupTier: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummaryAggregatedByTierGroup',
        },
        type: 'array',
      },
      byClassificationSubGroup: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummaryAggregatedBySubGroup',
        },
        type: 'array',
      },
      className: {
        type: 'string',
      },
      contributionPercentage: {
        type: 'number',
      },
      contributionType: {
        type: 'string',
      },
      modalPremium: {
        type: 'number',
      },
      numberOfParticipants: {
        type: 'number',
      },
      paymentMode: {
        type: 'string',
      },
      payor: {
        type: 'string',
      },
      useSubGroups: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPremiumSummaryAggregatedByPayor: {
    properties: {
      annualPremium: {
        type: 'number',
      },
      byClassificationGroup: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummaryAggregatedByGroup',
        },
        type: 'array',
      },
      contributionPercentage: {
        type: 'number',
      },
      contributionType: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      modalPremium: {
        type: 'number',
      },
      numberOfParticipants: {
        type: 'number',
      },
      paymentMode: {
        type: 'string',
      },
      payor: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPremiumSummaryAggregatedBySubGroup: {
    properties: {
      annualPremium: {
        type: 'number',
      },
      byClassificationSubGroupTier: {
        items: {
          $ref: 'AgentBenefitsMasterPremiumSummaryAggregatedByTierGroup',
        },
        type: 'array',
      },
      contributionPercentage: {
        type: 'number',
      },
      contributionType: {
        type: 'string',
      },
      modalPremium: {
        type: 'number',
      },
      numberOfParticipants: {
        type: 'number',
      },
      paymentMode: {
        type: 'string',
      },
      payor: {
        type: 'string',
      },
      subGroupName: {
        type: 'string',
      },
      subGroupType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsMasterPremiumSummaryAggregatedByTierGroup: {
    properties: {
      annualPremium: {
        type: 'number',
      },
      contributionPercentage: {
        type: 'number',
      },
      contributionType: {
        type: 'string',
      },
      coverageTierCd: {
        type: 'string',
      },
      modalPremium: {
        type: 'number',
      },
      numberOfParticipants: {
        type: 'number',
      },
      paymentMode: {
        type: 'string',
      },
      payor: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBenefitsRatingInfo: {
    properties: {
      classificationSubgroupName: {
        type: 'string',
      },
      classificationSubgroupOid: {
        type: 'string',
      },
      estimatedParticipantCount: {
        format: 'int',
        type: 'integer',
      },
      estimatedVolume: {
        type: 'number',
      },
      rate: {
        type: 'number',
      },
      tier: {
        type: 'string',
      },
      tierRatings: {
        items: {
          $ref: 'AgentBenefitsRatingInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillablePolicyTermDetails: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingAccountAction: {
    properties: {
      actionCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingAccountDetails: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      accountStatus: {
        type: 'string',
      },
      billType: {
        type: 'string',
      },
      billableAmount: {
        $ref: 'BillingMoneyDetailed',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'AgentBillingContact',
      },
      blobCd: {
        type: 'string',
      },
      coverageGroups: {
        items: {
          $ref: 'AgentCoverageGroupDetails',
        },
        type: 'array',
      },
      currencyCd: {
        type: 'string',
      },
      currentDue: {
        $ref: 'AgentMoney',
      },
      customerName: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dueDay: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      earnedPremiumWriteOff: {
        $ref: 'BillingMoneyDetailed',
      },
      email: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      invoicingCalendar: {
        $ref: 'AgentBillingInvoiceCalendar',
      },
      latestInvoice: {
        $ref: 'Invoice',
      },
      minimumDue: {
        $ref: 'BillingMoneyDetailed',
      },
      mortgageeInfo: {
        $ref: 'AgentMortgageeDetails',
      },
      overpaidAmountOption: {
        type: 'string',
      },
      pastDue: {
        $ref: 'BillingMoneyDetailed',
      },
      phoneNumber: {
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'PolicyTerm',
        },
        type: 'array',
      },
      priorDue: {
        $ref: 'AgentMoney',
      },
      producerCd: {
        type: 'string',
      },
      recurringPaymentsMethod: {
        $ref: 'AgentRecurringPaymentDetails',
      },
      suspenseAmount: {
        $ref: 'AgentMoney',
      },
      totalDue: {
        $ref: 'BillingMoneyDetailed',
      },
      totalPaid: {
        $ref: 'BillingMoneyDetailed',
      },
    },
    type: 'object',
  },
  AgentBillingAccountSummary: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      billType: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'AgentBillingContact',
      },
      blobCd: {
        type: 'string',
      },
      currentDue: {
        $ref: 'AgentMoney',
      },
      dueDay: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      extensionFields: {
        type: 'object',
      },
      invoicingCalendar: {
        $ref: 'AgentBillingInvoiceCalendar',
      },
      latestInvoice: {
        $ref: 'Invoice',
      },
      masterPolicies: {
        items: {
          $ref: 'AgentMasterPolicy',
        },
        type: 'array',
      },
      minimumDue: {
        $ref: 'AgentMoney',
      },
      pastDue: {
        $ref: 'AgentMoney',
      },
      policies: {
        items: {
          $ref: 'AgentPolicyTermSummary',
        },
        type: 'array',
      },
      priorDue: {
        $ref: 'AgentMoney',
      },
      totalDue: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentBillingAccountUpdatePaymentMethodRequest: {
    properties: {
      paymentMethodId: {
        format: 'int',
        type: 'integer',
      },
      policyEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policySuffix: {
        type: 'string',
      },
      useRecurringMethodForRefundInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentBillingAccountUpdateRequest: {
    properties: {
      accountName: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'BillingNameInfo',
      },
      extensionFields: {
        type: 'object',
      },
    },
    type: 'object',
  },
  AgentBillingAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingBasicMoratorium: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      holdTypesCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      name: {
        type: 'string',
      },
      policiesQuantity: {
        format: 'int',
        type: 'integer',
      },
      reasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingCalculateFutureStatementDate: {
    properties: {
      futureStatementDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingCalculateInstallmentsScheduleRequest: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      balanceChangeAmounts: {
        items: {
          $ref: 'BillingBalanceAmount',
        },
        type: 'array',
      },
      currencyCd: {
        type: 'string',
      },
      downPaymentAmount: {
        type: 'number',
      },
      dueDateStartFrom: {
        format: 'date-time',
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      firstInstallmentAfterDays: {
        format: 'int',
        type: 'integer',
      },
      installmentStartDate: {
        format: 'date-time',
        type: 'string',
      },
      overpaidAmountOption: {
        type: 'string',
      },
      paymentPlanCd: {
        type: 'string',
      },
      scheduleEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
      txTypeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingCalculateInstallmentsScheduleResponse: {
    properties: {
      installments: {
        items: {
          $ref: 'AgentInstallmentSummary',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingCalculateInstallmentsScheduleStartDatesResponse: {
    properties: {
      dueDateStartFrom: {
        format: 'date-time',
        type: 'string',
      },
      firstInstallmentAfterDays: {
        format: 'int',
        type: 'integer',
      },
      installmentStartDates: {
        items: {
          format: 'date-time',
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingChangeHoldRequest: {
    properties: {
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'AgentBillablePolicyTermDetails',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingContact: {
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      nameTypeCd: {
        enum: ['IND', 'OTH'],
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      prefix: {
        type: 'string',
      },
      prefixCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingDownPaymentDetails: {
    properties: {
      changeDownPaymentAmount: {
        type: 'boolean',
      },
      currencyCd: {
        type: 'string',
      },
      downPaymentAmount: {
        items: {
          $ref: 'AgentDownPayment',
        },
        type: 'array',
      },
      otherReason: {
        type: 'boolean',
      },
      reasonForReducingCd: {
        type: 'string',
      },
      reducedDownPaymentAmount: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentBillingGeography: {
    properties: {
      countryCd: {
        type: 'string',
      },
      stateCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingHold: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      billingContact: {
        type: 'string',
      },
      categoryCd: {
        enum: ['hold', 'moratorium', 'nsfHold', 'renewalHold'],
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      name: {
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'AgentBillablePolicyTermDetails',
        },
        type: 'array',
      },
      reason: {
        type: 'string',
      },
      typesCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingHoldRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      holdTypesCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'AgentBillablePolicyTermDetails',
        },
        type: 'array',
      },
      reasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingInvoiceCalendar: {
    properties: {
      dueDay: {
        format: 'int',
        type: 'integer',
      },
      frequency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingInvoiceDetails: {
    properties: {
      billingPeriodEnd: {
        format: 'date-time',
        type: 'string',
      },
      billingPeriodStart: {
        format: 'date-time',
        type: 'string',
      },
      businessName: {
        type: 'string',
      },
      coverageCount: {
        format: 'int',
        type: 'integer',
      },
      coverages: {
        items: {
          $ref: 'BillableCoverage',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingInvoiceSummary: {
    properties: {
      billingPeriod: {
        type: 'string',
      },
      currentDue: {
        $ref: 'AgentMoney',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      invoiceAdditionalStatusCd: {
        type: 'string',
      },
      invoiceNumber: {
        type: 'string',
      },
      invoiceStatus: {
        type: 'string',
      },
      priorDue: {
        $ref: 'AgentMoney',
      },
      totalDue: {
        $ref: 'AgentMoney',
      },
      uip: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentBillingMoneyAdditionalDetailed: {
    properties: {
      currencyCd: {
        type: 'string',
      },
      details: {
        type: 'object',
      },
      value: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentBillingMoratorium: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      holdTypesCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      name: {
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'AgentMoratoriumPolicyTerm',
        },
        type: 'array',
      },
      policiesCriteria: {
        $ref: 'AgentBillingMoratoriumPolicyCriteria',
      },
      policiesQuantity: {
        format: 'int',
        type: 'integer',
      },
      reasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingMoratoriumCreateRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      excludedPolicies: {
        items: {
          $ref: 'AgentBillablePolicyTermDetails',
        },
        type: 'array',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      holdTypesCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      policiesCriteria: {
        $ref: 'AgentBillingMoratoriumPolicyCriteria',
      },
      reasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingMoratoriumCreateResponse: {
    properties: {
      id: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentBillingMoratoriumPolicyCriteria: {
    properties: {
      lobCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      producerCd: {
        type: 'string',
      },
      productCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      stateCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      zipCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentBillingMoratoriumUpdateRequest: {
    properties: {
      excludedPolicies: {
        items: {
          $ref: 'AgentBillablePolicyTermDetails',
        },
        type: 'array',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      policiesCriteria: {
        $ref: 'AgentBillingMoratoriumPolicyCriteria',
      },
    },
    type: 'object',
  },
  AgentBillingPaymentAllocation: {
    properties: {
      invoiceItemsAllocationAmount: {
        type: 'number',
      },
      invoiceNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingPaymentIdentifier: {
    properties: {
      id: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentBillingPaymentMethodDetails: {
    properties: {
      cash: {
        $ref: 'AgentPaymentDetailsCash',
      },
      cheque: {
        $ref: 'AgentPaymentDetailsCheque',
      },
      creditCard: {
        $ref: 'AgentPaymentDetailsCreditCard',
      },
      eft: {
        $ref: 'AgentPaymentDetailsEft',
      },
      pciCreditCard: {
        $ref: 'AgentPaymentDetailsPciCreditCard',
      },
      savedPaymentMethod: {
        $ref: 'AgentPaymentMethod',
      },
      type: {
        enum: ['creditCard', 'pciCreditCard', 'eft', 'cheque', 'savedPaymentMethod', 'cash'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingPaymentPerPolicy: {
    properties: {
      allocations: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      referenceId: {
        type: 'string',
      },
      subType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingPaymentRequest: {
    properties: {
      amount: {
        $ref: 'AgentMoney',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      referenceId: {
        maxLength: 255,
        minLength: 0,
        type: 'string',
      },
      savePaymentMethod: {
        type: 'boolean',
      },
      subType: {
        maxLength: 255,
        minLength: 0,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBillingRefundPaymentMethodDetails: {
    properties: {
      cash: {
        $ref: 'AgentPaymentDetailsCash',
      },
      cheque: {
        $ref: 'AgentPaymentDetailsCheque',
      },
      creditCard: {
        $ref: 'AgentPaymentDetailsCreditCard',
      },
      description: {
        type: 'string',
      },
      eft: {
        $ref: 'AgentPaymentDetailsEft',
      },
      pciCreditCard: {
        $ref: 'AgentPaymentDetailsPciCreditCard',
      },
      savedPaymentMethod: {
        $ref: 'AgentPaymentMethod',
      },
      type: {
        enum: ['creditCard', 'pciCreditCard', 'eft', 'cheque', 'savedPaymentMethod', 'cash'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentItem: {
    properties: {
      allocations: {
        items: {
          $ref: 'AgentBulkPaymentItemAllocation',
        },
        type: 'array',
      },
      amount: {
        type: 'number',
      },
      chequeDetails: {
        $ref: 'AgentPaymentDetailsCheque',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      paymentType: {
        enum: ['NSF', 'AC', 'PS', 'SBWO', 'EPWO', 'other'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentItemAllocation: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      amount: {
        type: 'number',
      },
      amountRetained: {
        type: 'number',
      },
      commissionRetained: {
        type: 'boolean',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      policyEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      statusCd: {
        enum: ['PENDING', 'ALLOCATED', 'FAILED'],
        type: 'string',
      },
      typeCd: {
        enum: ['ACCOUNT', 'POLICY_TERM', 'SUSPENSE', 'AGENCY'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      payor: {
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentResponse: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      completionDate: {
        format: 'date-time',
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      payor: {
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentSummary: {
    properties: {
      amount: {
        readOnly: true,
        type: 'number',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentBulkPaymentsSummary: {
    properties: {
      allocatedAmount: {
        $ref: 'AgentMoney',
      },
      paymentAmount: {
        $ref: 'AgentMoney',
      },
      paymentsCount: {
        format: 'int',
        type: 'integer',
      },
      suspendedAmount: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentBusinessCustomerAdditionalName: {
    properties: {
      id: {
        format: 'int',
        type: 'integer',
      },
      nameDba: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCampaignCharacteristics: {
    properties: {
      countryCd: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      excludeActivePolicyholders: {
        type: 'boolean',
      },
      leadTargetSource: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentCampaignOwner: {
    properties: {
      queueName: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
      version: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentChangeBrokerPolicyRequest: {
    properties: {
      commisionImpact: {
        type: 'boolean',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      effectiveUpon: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
      targetProducerCd: {
        type: 'string',
      },
      targetSubproducerCd: {
        type: 'string',
      },
      transferType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentChangeBrokerPolicyResponse: {
    properties: {
      policyNumber: {
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentChangeBrokerQuoteRequest: {
    properties: {
      producerCd: {
        type: 'string',
      },
      subProducerCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentChangeBrokerQuoteResponse: {
    properties: {
      policyNumber: {
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentChangePaymentPlanRequest: {
    properties: {
      downPaymentDetails: {
        $ref: 'AgentBillingDownPaymentDetails',
      },
      paymentPlanCd: {
        type: 'string',
      },
      startDateOverride: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentClaimAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressTypeCd: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      latitude: {
        type: 'string',
      },
      longitude: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentClaimDetails: {
    properties: {
      additionalClaimNumber: {
        type: 'string',
      },
      addresses: {
        items: {
          $ref: 'AgentClaimAddress',
        },
        type: 'array',
      },
      causeOfLossCd: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatusCd: {
        type: 'string',
      },
      claimsPolicyStatus: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
      fileOwner: {
        $ref: 'FileOwner',
      },
      lineOfBusinessCd: {
        type: 'string',
      },
      lossDesc: {
        type: 'string',
      },
      lossDt: {
        format: 'date-time',
        type: 'string',
      },
      lossLocationDesc: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'ClaimParty',
        },
        type: 'array',
      },
      policy: {
        $ref: 'ClaimPolicy',
      },
      policyNumber: {
        type: 'string',
      },
      policyProductCd: {
        type: 'string',
      },
      policyProductVersion: {
        format: 'double',
        type: 'number',
      },
      productCd: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      reportedDt: {
        format: 'date-time',
        type: 'string',
      },
      totalIncurred: {
        $ref: 'ClaimMoney',
      },
    },
    type: 'object',
  },
  AgentClaimSummary: {
    properties: {
      additionalClaimNumber: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatusCd: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      lossDesc: {
        type: 'string',
      },
      lossDt: {
        format: 'date-time',
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      reportedDt: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCommonSuspense: {
    properties: {
      activeRefund: {
        $ref: 'AgentSuspenseRefundSummary',
      },
      amount: {
        type: 'number',
      },
      blobCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'AgentSuspenseCustomerDetails',
      },
      hasRefundsInd: {
        type: 'boolean',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      paymentChannelCd: {
        type: 'string',
      },
      paymentMethodType: {
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      suspenseStatusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCoverageGroupDetails: {
    properties: {
      billingGroupName: {
        type: 'string',
      },
      billingGroupNumber: {
        type: 'string',
      },
      coverageName: {
        type: 'string',
      },
      coverageTierName: {
        type: 'string',
      },
      currentDue: {
        type: 'number',
      },
      masterPolicyEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      masterPolicyNumber: {
        type: 'string',
      },
      payorName: {
        type: 'string',
      },
      priorDue: {
        type: 'number',
      },
      totalDue: {
        type: 'number',
      },
      totalPaid: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentCreateTransactionRequest: {
    properties: {
      allocations: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      subTypeCd: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerAccountAffinityGroup: {
    properties: {
      accountGroupName: {
        type: 'string',
      },
      accountGroupNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerAccountDesignatedContact: {
    properties: {
      id: {
        format: 'int',
        type: 'integer',
      },
      phoneNumber: {
        type: 'string',
      },
      userFirstName: {
        type: 'string',
      },
      userLastName: {
        type: 'string',
      },
      userRoles: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerAccountDetails: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      affinityGroups: {
        items: {
          $ref: 'AgentCustomerAccountAffinityGroup',
        },
        type: 'array',
      },
      confidential: {
        type: 'boolean',
      },
      designatedContacts: {
        items: {
          $ref: 'AgentCustomerAccountDesignatedContact',
        },
        type: 'array',
      },
      specialHandling: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerAddress: {
    properties: {
      accuracy: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      attention: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      duration: {
        format: 'int',
        type: 'integer',
      },
      effectiveFrom: {
        format: 'date',
        type: 'string',
      },
      effectiveTo: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      inCareOf: {
        type: 'string',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
      postalCode: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
      referenceId: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
      subdivision: {
        type: 'string',
      },
      temporary: {
        type: 'boolean',
      },
      validationIndicator: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentCustomerChat: {
    properties: {
      chatId: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentCustomerEmail: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentDate: {
        format: 'date',
        type: 'string',
      },
      consentStatus: {
        type: 'string',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      emailId: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentCustomerEmploymentInfo: {
    properties: {
      asOfDate: {
        format: 'date',
        type: 'string',
      },
      employerName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      jobTitleCd: {
        type: 'string',
      },
      jobTitleDescription: {
        type: 'string',
      },
      occupationCd: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      occupationStatusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerNavigationLink: {
    properties: {
      id: {
        type: 'string',
      },
      linkType: {
        enum: ['MERGE_FROM', 'MERGE_TO'],
        type: 'string',
      },
      sourceNumber: {
        type: 'string',
      },
      targetNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerPhone: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentDate: {
        format: 'date',
        type: 'string',
      },
      consentStatus: {
        type: 'string',
      },
      consentStatusDeniedReason: {
        type: 'string',
      },
      consentToTextDate: {
        format: 'date',
        type: 'string',
      },
      consentToTextStatus: {
        type: 'string',
      },
      consentToTextStatusDeniedReason: {
        type: 'string',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      duration: {
        format: 'int',
        type: 'integer',
      },
      effectiveFrom: {
        format: 'date',
        type: 'string',
      },
      effectiveTo: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      preferredDaysToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      preferredInd: {
        type: 'boolean',
      },
      preferredTimesToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      temporary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentCustomerRelationship: {
    properties: {
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        readOnly: true,
        type: 'integer',
      },
      relationshipCustomerNumber: {
        type: 'string',
      },
      relationshipDescription: {
        type: 'string',
      },
      relationshipRole: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerServiceProvider: {
    properties: {
      comment: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      practiceId: {
        type: 'string',
      },
      providerId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerSocialNet: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      preferredInd: {
        type: 'boolean',
      },
      socialNetId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentCustomerWebAddress: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      preferredInd: {
        type: 'boolean',
      },
      webAddress: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentDeficiencyPolicyRequest: {
    properties: {
      billingAccountNumber: {
        type: 'string',
      },
      billingType: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      paymentPlanCd: {
        type: 'string',
      },
      premiumChangeAmountHolder: {
        $ref: 'AgentPremiumAmountHolder',
      },
    },
    type: 'object',
  },
  AgentDeficiencyPolicyResponse: {
    properties: {
      deficiencyAmount: {
        type: 'number',
      },
      totalRemainingDue: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentDestinationAccountsResponse: {
    properties: {
      accounts: {
        items: {
          $ref: 'AgentDestinationBillingAccount',
        },
        type: 'array',
      },
      defaultAccount: {
        type: 'string',
      },
      warnings: {
        items: {
          $ref: 'AgentDestinationWarning',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentDestinationBillingAccount: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      billType: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      extensionFields: {
        type: 'object',
      },
      paymentPlanSummary: {
        $ref: 'AgentDestinationPaymentPlan',
      },
      totalDue: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  AgentDestinationPaymentPlan: {
    properties: {
      paymentPlanCd: {
        type: 'string',
      },
      paymentPlanInfo: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentDestinationWarning: {
    properties: {
      billingAccountNumber: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      message: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentDocumentBasicInfo: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      attachmentName: {
        type: 'string',
      },
      attachmentType: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      folderId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentDocumentBasicInfoRename: {
    properties: {
      attachmentName: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      folderId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentDownPayment: {
    properties: {
      amount: {
        type: 'number',
      },
      paymentMethodOrSuspenseId: {
        format: 'int',
        type: 'integer',
      },
      recurringPaymentMethodDesignation: {
        enum: ['BILLING_ACCOUNT', 'POLICY'],
        type: 'string',
      },
      reference: {
        type: 'string',
      },
      type: {
        enum: ['CREDIT_CARD', 'PCI_CREDIT_CARD', 'EFT', 'CHEQUE', 'SAVED_PAYMENT_METHOD', 'CASH', 'SUSPENSE'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentEmail: {
    properties: {
      email: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFileType: {
    properties: {
      fileType: {
        type: 'string',
      },
      mimeTypes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentFnolAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressTypeCd: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      latitude: {
        type: 'string',
      },
      longitude: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolAuthorityReport: {
    properties: {
      authorityType: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'AgentFnolParty',
        },
        type: 'array',
      },
      reportNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolClaim: {
    properties: {
      additionalClaimNumber: {
        type: 'string',
      },
      addresses: {
        items: {
          $ref: 'AgentFnolAddress',
        },
        type: 'array',
      },
      causeOfLossCd: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatusCd: {
        type: 'string',
      },
      claimsPolicyStatus: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
      fileOwner: {
        $ref: 'AgentFnolFileOwner',
      },
      lineOfBusinessCd: {
        type: 'string',
      },
      lossDesc: {
        type: 'string',
      },
      lossDt: {
        format: 'date-time',
        type: 'string',
      },
      lossLocationDesc: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'AgentFnolParty',
        },
        type: 'array',
      },
      policy: {
        $ref: 'AgentFnolClaimPolicy',
      },
      policyNumber: {
        type: 'string',
      },
      policyProductCd: {
        type: 'string',
      },
      policyProductVersion: {
        format: 'double',
        type: 'number',
      },
      productCd: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      reportedDt: {
        format: 'date-time',
        type: 'string',
      },
      totalIncurred: {
        $ref: 'AgentFnolMoney',
      },
    },
    type: 'object',
  },
  AgentFnolClaimImage: {
    properties: {
      authorityReports: {
        items: {
          $ref: 'AgentFnolAuthorityReport',
        },
        type: 'array',
      },
      claim: {
        $ref: 'AgentFnolClaim',
      },
      damages: {
        items: {
          $ref: 'AgentFnolDamage',
        },
        type: 'array',
      },
      serviceRequests: {
        items: {
          $ref: 'AgentFnolServiceRequest',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentFnolClaimPolicy: {
    properties: {
      agentRiskItems: {
        items: {
          $ref: 'AgentFnolRiskItem',
        },
        type: 'array',
      },
      componentName: {
        type: 'string',
      },
      inceptionDate: {
        format: 'date-time',
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'AgentFnolParty',
        },
        type: 'array',
      },
      policyNumber: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      verified: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentFnolCoverage: {
    properties: {
      componentName: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      coverageDetails: {
        items: {
          $ref: 'AgentFnolCoverageDetails',
        },
        type: 'array',
      },
      deductibleAmount: {
        $ref: 'AgentFnolMoney',
      },
      designatedCoverageInd: {
        type: 'boolean',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolCoverageDetails: {
    properties: {
      componentName: {
        type: 'string',
      },
      limitAmount: {
        $ref: 'AgentFnolMoney',
      },
      limitLevel: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolCoverageHeader: {
    properties: {
      coverageCd: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolCreationConfirmation: {
    properties: {
      identifier: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolDamage: {
    properties: {
      componentName: {
        type: 'string',
      },
      damageNumber: {
        type: 'string',
      },
      damageType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      features: {
        items: {
          $ref: 'AgentFnolFeature',
        },
        type: 'array',
      },
      itemizedLosses: {
        items: {
          $ref: 'AgentFnolItemizedLoss',
        },
        type: 'array',
      },
      loss: {
        $ref: 'AgentFnolLoss',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolDamageHeader: {
    properties: {
      damageNumber: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolEmail: {
    properties: {
      email: {
        type: 'string',
      },
      emailTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolFeature: {
    properties: {
      associatedInsurableRisk: {
        $ref: 'AgentFnolInsurableRiskHeader',
      },
      associatedInsurableRiskOid: {
        type: 'string',
      },
      claimant: {
        $ref: 'AgentFnolPartyRef',
      },
      coverage: {
        $ref: 'AgentFnolCoverageHeader',
      },
      coverageDesc: {
        type: 'string',
      },
      coverageOid: {
        type: 'string',
      },
      damage: {
        $ref: 'AgentFnolDamageHeader',
      },
      extension: {
        type: 'object',
      },
      featureId: {
        type: 'string',
      },
      featureIncurred: {
        $ref: 'AgentFnolMoney',
      },
      featureNumber: {
        type: 'string',
      },
      featureOwner: {
        $ref: 'AgentFnolFileOwner',
      },
      oid: {
        type: 'string',
      },
      reserves: {
        items: {
          $ref: 'AgentFnolReserve',
        },
        type: 'array',
      },
      statusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolFileOwner: {
    properties: {
      displayValue: {
        type: 'string',
      },
      refId: {
        type: 'string',
      },
      typeCd: {
        enum: ['INTERNALUSER', 'EXTERNALUSER', 'QUEUE'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolInsurableRisk: {
    properties: {
      associatedInsurableRiskOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      coverages: {
        items: {
          $ref: 'AgentFnolCoverage',
        },
        type: 'array',
      },
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      party: {
        $ref: 'AgentFnolParty',
      },
      scheduledItems: {
        items: {
          $ref: 'AgentFnolInsurableRisk',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentFnolInsurableRiskHeader: {
    properties: {
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolItemizedLoss: {
    properties: {
      associatedScheduledItemOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      estimatedValue: {
        type: 'number',
      },
      extension: {
        type: 'object',
      },
      item: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolLoss: {
    properties: {
      addresses: {
        items: {
          $ref: 'AgentFnolAddress',
        },
        type: 'array',
      },
      associatedRiskItemOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      damageDesc: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
      lossDesc: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'AgentFnolParty',
        },
        type: 'array',
      },
      partyType: {
        type: 'string',
      },
      riskItemOid: {
        type: 'string',
      },
      severityCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currencyCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolParty: {
    properties: {
      addresses: {
        items: {
          $ref: 'AgentFnolAddress',
        },
        type: 'array',
      },
      birthDt: {
        format: 'date-time',
        type: 'string',
      },
      companyNumber: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      contactPreferenceCd: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'AgentFnolEmail',
        },
        type: 'array',
      },
      extension: {
        type: 'object',
      },
      externalId: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      namePrefix: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      partyNumber: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'AgentFnolPhone',
        },
        type: 'array',
      },
      relationShipToInsuredCd: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'AgentFnolPartyRole',
        },
        type: 'array',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolPartyRef: {
    properties: {
      displayValue: {
        type: 'string',
      },
      refId: {
        type: 'string',
      },
      typeCd: {
        enum: ['PARTY', 'VENDOR'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolPartyRole: {
    properties: {
      claimsPartyRoleCd: {
        type: 'string',
      },
      claimsPartySubRoleCd: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
    },
    type: 'object',
  },
  AgentFnolPhone: {
    properties: {
      phone: {
        type: 'string',
      },
      phoneTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolReserve: {
    properties: {
      amount: {
        $ref: 'AgentFnolMoney',
      },
      typeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFnolRiskItem: {
    properties: {
      associatedInsurableRiskOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      coverages: {
        items: {
          $ref: 'AgentFnolCoverage',
        },
        type: 'array',
      },
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      party: {
        $ref: 'AgentFnolParty',
      },
      reportedRiskItemName: {
        type: 'string',
      },
      scheduledItems: {
        items: {
          $ref: 'AgentFnolInsurableRisk',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentFnolServiceRequest: {
    properties: {
      componentName: {
        type: 'string',
      },
      coverageOid: {
        type: 'string',
      },
      damageOid: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
      oid: {
        type: 'string',
      },
      serviceCd: {
        type: 'string',
      },
      vendors: {
        items: {
          $ref: 'AgentFnolVendor',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentFnolVendor: {
    properties: {
      contacts: {
        items: {
          $ref: 'AgentFnolParty',
        },
        type: 'array',
      },
      profile: {
        $ref: 'AgentFnolParty',
      },
      ratingCd: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentFolder: {
    properties: {
      actions: {
        type: 'object',
      },
      attachments: {
        items: {
          $ref: 'Document',
        },
        type: 'array',
      },
      documentTypes: {
        type: 'object',
      },
      folderId: {
        type: 'string',
      },
      folderName: {
        type: 'string',
      },
      subFolders: {
        items: {
          $ref: 'AgentFolder',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentHoldRemoveAccountRequest: {
    properties: {
      billingAccountNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentIndividualCustomerAdditionalName: {
    properties: {
      designationCd: {
        type: 'string',
      },
      designationDescription: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentInstallmentBilledAmount: {
    properties: {
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      policy: {
        $ref: 'AgentPolicyTermSummary',
      },
    },
    type: 'object',
  },
  AgentInstallmentSummary: {
    properties: {
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentInsuredPrincipal: {
    properties: {
      address: {
        $ref: 'AgentPolicyAddress',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      partyOid: {
        type: 'string',
      },
      primaryInsuredInd: {
        type: 'boolean',
      },
      principalRoleCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentLocationParty: {},
  AgentMasterPolicy: {
    properties: {
      certificates: {
        items: {
          $ref: 'AgentPolicyTermSummary',
        },
        type: 'array',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentMessage: {
    properties: {
      code: {
        type: 'string',
      },
      context: {
        type: 'string',
      },
      message: {
        type: 'string',
      },
      severity: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentMoney: {
    properties: {
      currencyCd: {
        type: 'string',
      },
      value: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentMoneyAdditionalDetails: {
    properties: {
      amountType: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      value: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentMoratoriumPolicy: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      agencyCd: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'BillingNameInfo',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      policyHoldStatusCd: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentMoratoriumPolicyTerm: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      accountOwnerName: {
        type: 'string',
      },
      addressRepresentation: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      policyHoldStatusCd: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      producerCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentMortgageeDetails: {
    properties: {
      address: {
        $ref: 'AgentBillingAddress',
      },
      loanNumber: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentNonPersonParty: {
    properties: {
      additionalNames: {
        items: {
          $ref: 'NonPersonPartyAdditionalName',
        },
        type: 'array',
      },
      agency: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      businessName: {
        type: 'string',
      },
      confidentialFlag: {
        type: 'boolean',
      },
      confidentialReference: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      lastUpdated: {
        format: 'date-time',
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      partyId: {
        type: 'string',
      },
      partyType: {
        type: 'string',
      },
      roles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentNsfCancellationRequest: {
    properties: {
      ignoredByNsfCancellation: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentNsfCounter: {
    properties: {
      allocationAmount: {
        $ref: 'AgentMoney',
      },
      increaseNfsCount: {
        type: 'boolean',
      },
      reasonForExcludeCd: {
        type: 'string',
      },
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
      transactionReasonCd: {
        type: 'string',
      },
      transactionSubtypeCd: {
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentNsfCounterUpdateRequest: {
    properties: {
      increaseNsfCount: {
        type: 'boolean',
      },
      reasonForExcludeCd: {
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentNsfExcludeReason: {
    properties: {
      reasonCd: {
        type: 'string',
      },
      reasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunity: {
    properties: {
      campaignId: {
        format: 'int',
        type: 'integer',
      },
      closeReason: {
        type: 'string',
      },
      closeReasonDescription: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dateCreated: {
        format: 'date',
        type: 'string',
      },
      dateModified: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      opportunityChannelCd: {
        type: 'string',
      },
      opportunityId: {
        format: 'int',
        type: 'integer',
      },
      opportunityLikelihoodCd: {
        type: 'string',
      },
      potential: {
        $ref: 'AgentMoney',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunityAssociation: {
    properties: {
      actualPremium: {
        type: 'number',
      },
      associationNumber: {
        type: 'string',
      },
      associationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunityDetails: {
    properties: {
      campaignId: {
        format: 'int',
        type: 'integer',
      },
      closeReason: {
        type: 'string',
      },
      closeReasonDescription: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dateCreated: {
        format: 'date',
        type: 'string',
      },
      dateModified: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      opportunityAssociations: {
        items: {
          $ref: 'AgentOpportunityAssociation',
        },
        type: 'array',
      },
      opportunityChannelCd: {
        type: 'string',
      },
      opportunityId: {
        format: 'int',
        type: 'integer',
      },
      opportunityLikelihoodCd: {
        type: 'string',
      },
      owner: {
        $ref: 'AgentOpportunityOwner',
      },
      potential: {
        $ref: 'AgentMoney',
      },
      productsInfo: {
        items: {
          $ref: 'AgentOpportunityProductInfo',
        },
        type: 'array',
      },
      referral: {
        $ref: 'AgentOpportunityUserAssignment',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunityOwner: {
    properties: {
      queueName: {
        type: 'string',
      },
      type: {
        enum: ['INTERNAL', 'QUEUE'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunityProductInfo: {
    properties: {
      lobCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      productName: {
        readOnly: true,
        type: 'string',
      },
      riskItemCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentOpportunityUserAssignment: {
    properties: {
      displayValue: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentParty: {
    properties: {
      agency: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      confidentialFlag: {
        type: 'boolean',
      },
      confidentialReference: {
        type: 'string',
      },
      entities: {
        items: {
          $ref: 'PartyEntityReference',
        },
        type: 'array',
      },
      lastUpdated: {
        format: 'date-time',
        type: 'string',
      },
      partyId: {
        type: 'string',
      },
      partyType: {
        type: 'string',
      },
      relationships: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      roles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentPartyDetails: {
    properties: {
      agency: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      confidentialFlag: {
        type: 'boolean',
      },
      confidentialReference: {
        type: 'string',
      },
      lastUpdated: {
        format: 'date-time',
        type: 'string',
      },
      partyId: {
        type: 'string',
      },
      partyType: {
        type: 'string',
      },
      roles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentPaymentDetailsCash: {
    properties: {
      extensionFields: {
        type: 'object',
      },
      profileId: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentDetailsCheque: {
    properties: {
      bankAccountNumber: {
        type: 'string',
      },
      bankCode: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      chequeDate: {
        format: 'date',
        type: 'string',
      },
      chequeNumber: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      payeeName: {
        type: 'string',
      },
      profileId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentDetailsCreditCard: {
    properties: {
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      fullName: {
        type: 'string',
      },
      fullNumber: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetails',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentDetailsEft: {
    properties: {
      accountHolderInfo: {
        $ref: 'BillingNameInfo',
      },
      accountNumber: {
        type: 'string',
      },
      accountTypeCd: {
        type: 'string',
      },
      bankAccountHolderName: {
        type: 'string',
      },
      bankAccountHolderNamePhonetic: {
        type: 'string',
      },
      bankAccountType: {
        type: 'string',
      },
      bankBranchCd: {
        type: 'string',
      },
      bankCd: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      effectiveTerm: {
        $ref: 'BillingEffectiveTerm',
      },
      eftProtocolFormReceived: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      internationalAchFormatting: {
        type: 'boolean',
      },
      lastName: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetails',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusUpdatedBy: {
        type: 'string',
      },
      transitNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentDetailsPciCreditCard: {
    properties: {
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      fullName: {
        type: 'string',
      },
      fullNumber: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetails',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentMethod: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      creditCardType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      issuedBy: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodAssignments: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      policies: {
        items: {
          $ref: 'AgentPolicyPaymentMethodAssignments',
        },
        type: 'array',
      },
      recurringPaymentMethod: {
        type: 'boolean',
      },
      refundPaymentMethod: {
        type: 'boolean',
      },
      useRecurringMethodForRefundInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodCreateResponse: {
    properties: {
      id: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodDetails: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      bankAccountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      chequeNumber: {
        type: 'string',
      },
      creditCardType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      issuedBy: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      profileId: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodResponse: {
    properties: {
      creditCard: {
        $ref: 'AgentPaymentDetailsCreditCard',
      },
      eft: {
        $ref: 'AgentPaymentDetailsEft',
      },
      pciCreditCard: {
        $ref: 'AgentPaymentDetailsPciCreditCard',
      },
      savedPaymentMethod: {
        $ref: 'AgentPaymentMethod',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodSetup: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      policies: {
        items: {
          $ref: 'AgentPolicyPaymentMethodSetup',
        },
        type: 'array',
      },
      recurringPaymentMethod: {
        $ref: 'AgentPaymentMethod',
      },
      refundPaymentMethod: {
        $ref: 'AgentPaymentMethod',
      },
      useRecurringMethodForRefundInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodTypes: {
    properties: {
      paymentMethodTypeCd: {
        type: 'string',
      },
      paymentMethodTypeDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentMethodUpdateRequest: {
    properties: {
      creditCard: {
        $ref: 'AgentPaymentDetailsCreditCard',
      },
      eft: {
        $ref: 'AgentPaymentDetailsEft',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      pciCreditCard: {
        $ref: 'AgentPaymentDetailsPciCreditCard',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentPlanOptionDetails: {
    properties: {
      changeDownPaymentAmount: {
        type: 'boolean',
      },
      downPaymentAmount: {
        items: {
          $ref: 'AgentDownPayment',
        },
        type: 'array',
      },
      otherReason: {
        type: 'boolean',
      },
      paymentPlanCd: {
        type: 'string',
      },
      reasonForReducing: {
        type: 'string',
      },
      reducedDownPaymentAmount: {
        type: 'number',
      },
    },
    type: 'object',
  },
  AgentPaymentPlanSummary: {
    properties: {
      billType: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      enabledForNewBusiness: {
        type: 'boolean',
      },
      enabledForRenewal: {
        type: 'boolean',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      firstInstallment: {
        type: 'string',
      },
      installmentFrequency: {
        format: 'int',
        type: 'integer',
      },
      numberInstallments: {
        format: 'int',
        type: 'integer',
      },
      planCd: {
        type: 'string',
      },
      recurringPaymentsRule: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentResult: {
    properties: {
      paymentNumber: {
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPaymentTransactionSubtype: {
    properties: {
      transactionSubtype: {
        type: 'string',
      },
      transactionSubtypeDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPersonParty: {},
  AgentPersonalBillingAccountRequest: {
    properties: {
      accountName: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'BillingNameInfo',
      },
      billingType: {
        enum: ['direct', 'mortgageeBilled', 'agency'],
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      email: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      mortgageeInfo: {
        $ref: 'AgentMortgageeDetails',
      },
      overpaidAmountOption: {
        enum: ['nextInstallments', 'allInstallments'],
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      recurringPaymentMethodId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentPhone: {
    properties: {
      phone: {
        type: 'string',
      },
      phoneTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPoliciesPaymentAllocationRequest: {
    properties: {
      amount: {
        $ref: 'AgentMoney',
      },
      policies: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentPolicyAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProv: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicyCoverage: {
    properties: {
      additionalLimitAmount: {
        type: 'number',
      },
      coverLevelCd: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      deductibleAmount: {
        type: 'number',
      },
      deductibles: {
        items: {
          $ref: 'PolicyDeductible',
        },
        type: 'array',
      },
      deductiblesInfo: {
        items: {
          $ref: 'PolicyDeductible',
        },
        type: 'array',
      },
      limitAmount: {
        type: 'number',
      },
      limits: {
        items: {
          $ref: 'PolicyLimit',
        },
        type: 'array',
      },
      limitsInfo: {
        items: {
          $ref: 'PolicyLimit',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      premiums: {
        items: {
          $ref: 'AgentPolicyPremium',
        },
        type: 'array',
      },
      subCoverageCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicyDetails: {
    properties: {
      coverages: {
        items: {
          $ref: 'AgentPolicyCoverage',
        },
        type: 'array',
      },
      currencyCode: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      expired: {
        type: 'boolean',
      },
      instanceName: {
        type: 'string',
      },
      insuredAndPrincipals: {
        items: {
          $ref: 'AgentInsuredPrincipal',
        },
        type: 'array',
      },
      lob: {
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'AgentPolicyParty',
        },
        type: 'array',
      },
      pendingRevisionNumber: {
        format: 'int',
        type: 'integer',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      productCode: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      renewable: {
        type: 'boolean',
      },
      revisionNumber: {
        format: 'int',
        type: 'integer',
      },
      riskItems: {
        items: {
          $ref: 'PolicyRiskItem',
        },
        type: 'array',
      },
      rootEntityType: {
        type: 'string',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      totalPremium: {
        type: 'number',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionType: {
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicyParty: {
    properties: {
      address: {
        $ref: 'AgentPolicyAddress',
      },
      addresses: {
        items: {
          $ref: 'AddressDetails',
        },
        type: 'array',
      },
      dateOfBirth: {
        format: 'date',
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'EmailContact',
        },
        type: 'array',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      insuredEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      maritalStatusCd: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      namePrefix: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'PhoneContact',
        },
        type: 'array',
      },
      suffix: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicyPaymentAllocation: {
    properties: {
      allocationAmounts: {
        items: {
          $ref: 'BillingBalanceAmount',
        },
        type: 'array',
      },
      amount: {
        $ref: 'AgentMoney',
      },
      policy: {
        $ref: 'AgentBillablePolicyTermDetails',
      },
    },
    type: 'object',
  },
  AgentPolicyPaymentMethodAssignments: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      recurringPaymentMethod: {
        type: 'boolean',
      },
      refundPaymentMethod: {
        type: 'boolean',
      },
      suffix: {
        type: 'string',
      },
      useRecurringMethodForRefundInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentPolicyPaymentMethodSetup: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      recurringPaymentMethod: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      refundPaymentMethod: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      useRecurringMethodForRefundInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentPolicyPremium: {
    properties: {
      actualAmount: {
        type: 'number',
      },
      changeAmount: {
        type: 'number',
      },
      factor: {
        type: 'number',
      },
      periodAmount: {
        type: 'number',
      },
      premiumCd: {
        type: 'string',
      },
      premiumTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicySummary: {
    properties: {
      currencyCode: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      expired: {
        type: 'boolean',
      },
      instanceName: {
        type: 'string',
      },
      lob: {
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      pendingRevisionNumber: {
        format: 'int',
        type: 'integer',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      productCode: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      renewable: {
        type: 'boolean',
      },
      revisionNumber: {
        format: 'int',
        type: 'integer',
      },
      rootEntityType: {
        type: 'string',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      totalPremium: {
        format: 'double',
        type: 'number',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionType: {
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPolicyTermSummary: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPrecalculation: {
    properties: {
      installments: {
        items: {
          $ref: 'AgentInstallmentSummary',
        },
        type: 'array',
      },
      policy: {
        $ref: 'AgentPolicyTermSummary',
      },
    },
    type: 'object',
  },
  AgentPremiumAmountHolder: {
    properties: {
      commission: {
        items: {
          $ref: 'BillingBalanceAmount',
        },
        type: 'array',
      },
      gross: {
        items: {
          $ref: 'BillingBalanceAmount',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  AgentPurchasePolicySubProductRequest: {
    properties: {
      extensionFields: {
        type: 'object',
      },
      quoteInfo: {
        $ref: 'AgentQuoteInfoDetails',
      },
    },
    type: 'object',
  },
  AgentPurchaseQuoteBillingAccount: {
    properties: {
      accountName: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      billType: {
        enum: ['direct', 'mortgageeBilled', 'agency'],
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      billingContact: {
        $ref: 'BillingNameInfo',
      },
      createNewAccount: {
        type: 'boolean',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      mortgageeInfo: {
        $ref: 'AgentMortgageeDetails',
      },
      overpaidAmountOption: {
        enum: ['nextInstallments', 'allInstallments'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPurchaseQuoteInfo: {
    properties: {
      automatedRequestInd: {
        type: 'boolean',
      },
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dueDateStartFrom: {
        format: 'date-time',
        type: 'string',
      },
      firstDueDateOverride: {
        format: 'date-time',
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      policyCurrency: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyNumberBeforeRewrite: {
        type: 'string',
      },
      premiumChangeAmountHolder: {
        $ref: 'AgentPremiumAmountHolder',
      },
      previousPaymentPlan: {
        type: 'string',
      },
      previousPolicyTerm: {
        $ref: 'AgentBillablePolicyTermDetails',
      },
      previousPolicyVersionId: {
        format: 'int',
        type: 'integer',
      },
      producerCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      renewalCycleNo: {
        format: 'int',
        type: 'integer',
      },
      riskPostalCode: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      subProducerCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termEffectiveDateBeforeRewrite: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      totalPremiumAmountHolder: {
        $ref: 'AgentPremiumAmountHolder',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txReason: {
        type: 'string',
      },
      txReasonText: {
        type: 'string',
      },
      txTypeName: {
        type: 'string',
      },
      ubiTermEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      underwriteCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentPurchaseQuoteRequest: {
    properties: {
      billingAccount: {
        $ref: 'AgentPurchaseQuoteBillingAccount',
      },
      defaultPaymentMethod: {
        $ref: 'AgentRecurringPaymentPlan',
      },
      extensionFields: {
        type: 'object',
      },
      paymentPlanOption: {
        $ref: 'AgentPaymentPlanOptionDetails',
      },
      quoteInfo: {
        $ref: 'AgentPurchaseQuoteInfo',
      },
    },
    type: 'object',
  },
  AgentQuoteInfoDetails: {
    properties: {
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      policyCurrency: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      premiumChangeAmountHolder: {
        $ref: 'AgentPremiumAmountHolder',
      },
      producerCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      riskPostalCode: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      subProducerCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      totalPremiumAmountHolder: {
        $ref: 'AgentPremiumAmountHolder',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txReason: {
        type: 'string',
      },
      txReasonText: {
        type: 'string',
      },
      txTypeName: {
        type: 'string',
      },
      underwriteCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentRecurringPaymentDetails: {
    properties: {
      description: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentRecurringPaymentPlan: {
    properties: {
      billingAccountPaymentMethod: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      policyTermPaymentMethod: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
    },
    type: 'object',
  },
  AgentRecurringPaymentSettingsUpdateRequest: {
    properties: {
      paymentMethodId: {
        format: 'int',
        type: 'integer',
      },
      policyEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policySuffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentRecurringPaymentsSettings: {
    properties: {
      extensionFields: {
        type: 'object',
      },
      policies: {
        items: {
          $ref: 'AgentRecurringPolicy',
        },
        type: 'array',
      },
      recurringPaymentsMethod: {
        $ref: 'AgentRecurringPaymentDetails',
      },
    },
    type: 'object',
  },
  AgentRecurringPolicy: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      recurringPaymentMethod: {
        $ref: 'AgentRecurringPaymentDetails',
      },
    },
    type: 'object',
  },
  AgentRefundByPolicyRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      allocations: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentRefundRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        $ref: 'AgentMoney',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentRefundUpdateRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      allocations: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentStatement: {
    properties: {
      applyDate: {
        format: 'date-time',
        type: 'string',
      },
      createDate: {
        format: 'date-time',
        type: 'string',
      },
      discardable: {
        type: 'boolean',
      },
      discarded: {
        type: 'boolean',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      invoiceNumber: {
        type: 'string',
      },
      minimumDue: {
        $ref: 'BillingMoneyDetailed',
      },
      pastDue: {
        $ref: 'BillingMoneyDetailed',
      },
      policyNumber: {
        type: 'string',
      },
      totalDue: {
        $ref: 'BillingMoneyDetailed',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentStrategyType: {
    properties: {
      strategyCd: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseCustomerDetails: {
    properties: {
      businessName: {
        type: 'string',
      },
      customerTypeCd: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefund: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentSuspenseRefundPaymentMethod',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefundCreateResponse: {
    properties: {
      documentNumber: {
        type: 'string',
      },
      documentType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefundHistory: {
    properties: {
      activeRefundInd: {
        type: 'boolean',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      refundId: {
        type: 'string',
      },
      refundStatusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefundPaymentMethod: {
    properties: {
      cheque: {
        $ref: 'AgentPaymentDetailsCheque',
      },
      creditCard: {
        $ref: 'AgentPaymentDetailsCreditCard',
      },
      eft: {
        $ref: 'AgentPaymentDetailsEft',
      },
      pciCreditCard: {
        $ref: 'AgentPaymentDetailsPciCreditCard',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefundResponse: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        type: 'number',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      lastStatusUpdateDate: {
        format: 'date-time',
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentSuspenseRefundPaymentMethod',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      suspenseId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentSuspenseRefundSummary: {
    properties: {
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      refundId: {
        type: 'string',
      },
      refundStatusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseRequest: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      businessName: {
        type: 'string',
      },
      contractNumber: {
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      customerTypeCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      paymentChannelCd: {
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
      underwriterCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseResponse: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      amount: {
        readOnly: true,
        type: 'number',
      },
      blobCd: {
        enum: ['personalAndCommercialBroadLine'],
        type: 'string',
      },
      businessName: {
        type: 'string',
      },
      completionDate: {
        format: 'date',
        readOnly: true,
        type: 'string',
      },
      contractNumber: {
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      customerTypeCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      items: {
        items: {
          $ref: 'AgentBulkPaymentItem',
        },
        type: 'array',
      },
      itemsCount: {
        readOnly: true,
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      paymentChannelCd: {
        type: 'string',
      },
      paymentType: {
        readOnly: true,
        type: 'string',
      },
      receivedFrom: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      reverseReasonCd: {
        type: 'string',
      },
      reverseReasonOther: {
        type: 'string',
      },
      statusCd: {
        readOnly: true,
        type: 'string',
      },
      suspenseStatusCd: {
        readOnly: true,
        type: 'string',
      },
      underwriterCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseReverseReason: {
    properties: {
      reasonCd: {
        type: 'string',
      },
      reasonOther: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspenseStatus: {
    properties: {
      description: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentSuspensesSummary: {
    properties: {
      clearedAmount: {
        $ref: 'AgentMoney',
      },
      clearedCount: {
        format: 'int',
        type: 'integer',
      },
      completedAmount: {
        $ref: 'AgentMoney',
      },
      completedCount: {
        format: 'int',
        type: 'integer',
      },
      suspendedAmount: {
        $ref: 'AgentMoney',
      },
      suspendedCount: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentTaskNote: {
    properties: {
      actions: {
        $ref: 'TaskNoteActions',
        description: 'Task note actions',
      },
      archived: {
        type: 'boolean',
      },
      category: {
        type: 'string',
      },
      confidential: {
        type: 'boolean',
      },
      created: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      performerDisplayValue: {
        type: 'string',
      },
      performerId: {
        type: 'string',
      },
      processId: {
        type: 'string',
      },
      taskId: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      updated: {
        format: 'date-time',
        type: 'string',
      },
      userNoteAdditionalInfo: {
        type: 'object',
      },
    },
    type: 'object',
  },
  AgentTaskReassignmentRequest: {
    properties: {
      agencyFrom: {
        type: 'string',
      },
      agencyTo: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      includeCompleted: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  AgentTaskUpdateRequest: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      assignment: {
        $ref: 'AssignmentInfo',
      },
      brandCd: {
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      dueDays: {
        format: 'int',
        type: 'integer',
      },
      dueHours: {
        format: 'int',
        type: 'integer',
      },
      dueMinutes: {
        format: 'int',
        type: 'integer',
      },
      dueTypeDate: {
        enum: ['DATE', 'PERIOD'],
        type: 'string',
      },
      note: {
        type: 'string',
      },
      priority: {
        format: 'int',
        type: 'integer',
      },
      processExtensionInfo: {
        type: 'object',
      },
      taskDescription: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      warningDate: {
        format: 'date-time',
        type: 'string',
      },
      warningDays: {
        format: 'int',
        type: 'integer',
      },
      warningHours: {
        format: 'int',
        type: 'integer',
      },
      warningMinutes: {
        format: 'int',
        type: 'integer',
      },
      warningTypeDate: {
        enum: ['DATE', 'PERIOD'],
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionAction: {
    properties: {
      actionCd: {
        type: 'string',
      },
      actionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionActionDetails: {
    properties: {
      actions: {
        items: {
          $ref: 'AgentTransactionActionSummary',
        },
        type: 'array',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionActionSummary: {
    properties: {
      actionCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionDeclineRequest: {
    properties: {
      declineReasonCd: {
        type: 'string',
      },
      otherReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionIdentifier: {
    properties: {
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionPaymentDetails: {
    properties: {
      allocations: {
        items: {
          $ref: 'BillingTransactionAllocation',
        },
        type: 'array',
      },
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      paymentDetails: {
        $ref: 'AgentBillingPaymentMethodDetails',
      },
      status: {
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionRefundAllocation: {
    properties: {
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      balanceDueBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      minimumDueBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      paidBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      policy: {
        $ref: 'AgentPolicyTermSummary',
      },
      refundable: {
        $ref: 'BillingMoneyDetailed',
      },
    },
    type: 'object',
  },
  AgentTransactionRefundDetails: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      allocations: {
        items: {
          $ref: 'AgentTransactionRefundAllocation',
        },
        type: 'array',
      },
      billingAddress: {
        $ref: 'AgentBillingAddress',
      },
      checkStubText: {
        type: 'string',
      },
      deliveryOption: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      payeeDetails: {
        $ref: 'BillingNameInfo',
      },
      paymentDetails: {
        $ref: 'AgentBillingRefundPaymentMethodDetails',
      },
      phone: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
      refundReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionSummary: {
    properties: {
      allocations: {
        items: {
          $ref: 'BillingTransactionAllocation',
        },
        type: 'array',
      },
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      billingTxReasonCd: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      paymentMethod: {
        $ref: 'AgentPaymentMethodDetails',
      },
      paymentReferenceId: {
        type: 'string',
      },
      policyTxReasonText: {
        type: 'string',
      },
      relatedTransactionNumber: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      subType: {
        type: 'string',
      },
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentTransactionTransferRequest: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      allocations: {
        items: {
          $ref: 'AgentPolicyPaymentAllocation',
        },
        type: 'array',
      },
      transferReasonCd: {
        type: 'string',
      },
      transferReasonOther: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUpdatePostCheckedTransactionRequest: {
    properties: {
      chequeDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserBasicProfile: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      billingAuthorityLevel: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      claimsAuthorityLevel: {
        type: 'string',
      },
      commissionable: {
        type: 'boolean',
      },
      countryCd: {
        type: 'string',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      faxNumber: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      roleNames: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sellsInsuranceProducts: {
        type: 'boolean',
      },
      signatureURI: {
        type: 'string',
      },
      userStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserCreateResponse: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      lastName: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      subProducer: {
        type: 'string',
      },
      userLogin: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      userWorkStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserDetails: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      billingAuthorityLevel: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      claimsAuthorityLevel: {
        type: 'string',
      },
      commissionable: {
        type: 'boolean',
      },
      countryCd: {
        type: 'string',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      faxNumber: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      roleNames: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sellsInsuranceProducts: {
        type: 'boolean',
      },
      signatureURI: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
      userLogin: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      userStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserNote: {
    properties: {
      category: {
        type: 'string',
      },
      confidential: {
        type: 'boolean',
      },
      created: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      performerId: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      updated: {
        format: 'date-time',
        type: 'string',
      },
      userNoteAdditionalInfo: {
        type: 'object',
      },
      userNoteName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserNoteCategory: {
    properties: {
      category: {
        type: 'string',
      },
      categoryCd: {
        type: 'string',
      },
      defaultText: {
        type: 'string',
      },
      defaultTitle: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserNoteCreateRequest: {
    properties: {
      category: {
        type: 'string',
      },
      confidential: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      userNoteAdditionalInfo: {
        type: 'object',
      },
      userNoteName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserNoteUpdateRequest: {
    properties: {
      category: {
        type: 'string',
      },
      confidential: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      userNoteAdditionalInfo: {
        type: 'object',
      },
    },
    type: 'object',
  },
  AgentUserProfile: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      agencyName: {
        type: 'string',
      },
      availableForWork: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      fullLoginName: {
        type: 'string',
      },
      fullName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      locationCd: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentUserProfileCreateRequest: {
    properties: {
      email: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserProfileDetails: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      agencyName: {
        type: 'string',
      },
      authorityLevels: {
        items: {
          $ref: 'AgentAuthorityLevel',
        },
        type: 'array',
      },
      availableForWork: {
        type: 'boolean',
      },
      billingAuthorityLevel: {
        type: 'string',
      },
      claimAuthorityLevel: {
        type: 'string',
      },
      defaultAuthorityLevel: {
        items: {
          $ref: 'AgentBasicAuthorityLevel',
        },
        type: 'array',
      },
      displayValue: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      fullLoginName: {
        type: 'string',
      },
      fullName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      locationCd: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
      privileges: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      productAccessRoles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  AgentUserProfileSummary: {
    properties: {
      availableForWork: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentUserProfileUpdateRequest: {
    properties: {
      email: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentVehicleParty: {},
  AgentWaiveFeeState: {
    properties: {
      description: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      transactionNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentWorkUserDetails: {
    properties: {
      availableForWork: {
        type: 'boolean',
      },
      defaultAgencyCd: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      locationCd: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AgentWorkUserProfile: {
    properties: {
      backupQueueDisplayValue: {
        type: 'string',
      },
      backupQueueId: {
        type: 'string',
      },
      backupUser: {
        $ref: 'AgentWorkUserDetails',
      },
      user: {
        $ref: 'AgentWorkUserDetails',
      },
    },
    type: 'object',
  },
  AppVersion: {
    properties: {
      buildNumber: {
        type: 'string',
      },
      buildTime: {
        type: 'string',
      },
      gatewayVersion: {
        type: 'string',
      },
      revision: {
        type: 'string',
      },
      version: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AssignmentInfo: {
    properties: {
      queueCode: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  AvailableOtherTransaction: {
    properties: {
      automaticOnlyInd: {
        type: 'boolean',
      },
      brandCd: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      effective: {
        format: 'date-time',
        type: 'string',
      },
      expiration: {
        format: 'date-time',
        type: 'string',
      },
      geography: {
        items: {
          $ref: 'AgentBillingGeography',
        },
        type: 'array',
      },
      policyForms: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      productCd: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      transactionSubtype: {
        type: 'string',
      },
      transactionSubtypeDescription: {
        type: 'string',
      },
      transactionType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BackOfficeAction: {
    properties: {
      actionCd: {
        type: 'string',
      },
      desciption: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BenefitsPaymentRequest: {
    properties: {
      amount: {
        $ref: 'AgentMoney',
        description: 'Only USD currency is supported',
      },
      paymentDetails: {
        $ref: 'BenefitsPaymentRequestDetails',
      },
    },
    type: 'object',
  },
  BenefitsPaymentRequestDetails: {
    properties: {
      ach: {
        $ref: 'BenifitsPaymentRequestDetailsAch',
      },
      cheque: {
        $ref: 'BenefitsPaymentRequestDetailsCheque',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BenefitsPaymentRequestDetailsCheque: {
    properties: {
      chequeNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BenifitsPaymentRequestDetailsAch: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      transitNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillableCoverage: {
    properties: {
      billingGroup: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      coverageSegmentClassifier: {
        type: 'string',
      },
      participantCount: {
        format: 'int',
        type: 'integer',
      },
      payor: {
        type: 'string',
      },
      policyPlan: {
        type: 'string',
      },
      premium: {
        $ref: 'AgentMoney',
      },
      productCd: {
        type: 'string',
      },
      referenceNumber: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  BillingAccountPolicyTerm: {
    properties: {
      billableAmount: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      billingStatus: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      holdInfo: {
        $ref: 'PolicyHold',
      },
      minimumDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      nsfCounter: {
        format: 'int',
        type: 'integer',
      },
      paidThrough: {
        format: 'date-time',
        type: 'string',
      },
      parentPolicyTerm: {
        $ref: 'AgentBillablePolicyTermDetails',
      },
      pastDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      paymentPlan: {
        type: 'string',
      },
      policyFlag: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      policyStatusDisplayCd: {
        type: 'string',
      },
      prepaid: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      productCd: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      totalDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      totalPaid: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      totalWrittenPremium: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingAddressDTO: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingBalanceAmount: {
    properties: {
      amount: {
        type: 'number',
      },
      amountType: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingCoverageDefinition: {
    properties: {
      coverageName: {
        type: 'string',
      },
      rateDefinition: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingCoverageSegment: {
    properties: {
      numberOfInsureds: {
        format: 'int',
        type: 'integer',
      },
      premiums: {
        items: {
          $ref: 'BillingModalPremium',
        },
        type: 'array',
      },
      rateInfo: {
        $ref: 'BillingRateInfo',
      },
      segmentClassifier: {
        $ref: 'BillingCoverageSegmentClassifier',
      },
    },
    type: 'object',
  },
  BillingCoverageSegmentClassifier: {
    properties: {
      classificationGroupId: {
        type: 'string',
      },
      classificationGroupName: {
        type: 'string',
      },
      classificationSubgroupId: {
        type: 'string',
      },
      classificationSubgroupName: {
        type: 'string',
      },
      coverageTierCode: {
        type: 'string',
      },
      coverageTierName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingEffectiveTerm: {
    properties: {
      effective: {
        format: 'date-time',
        type: 'string',
      },
      expiration: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingEffectiveTermDTO: {
    properties: {
      effective: {
        format: 'date-time',
        type: 'string',
      },
      expiration: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingInstallment: {
    properties: {
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      billDueDate: {
        format: 'date-time',
        type: 'string',
      },
      billGenerationDate: {
        format: 'date-time',
        type: 'string',
      },
      billedAllocations: {
        items: {
          $ref: 'AgentInstallmentBilledAmount',
        },
        type: 'array',
      },
      billedAmount: {
        $ref: 'BillingMoneyDetailed',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      prepaidAmount: {
        $ref: 'BillingMoneyDetailed',
      },
      status: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingInstallmentSchedule: {
    properties: {
      installments: {
        items: {
          $ref: 'AgentInstallmentSummary',
        },
        type: 'array',
      },
      planCd: {
        type: 'string',
      },
      planDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingInstallmentScheduleRequest: {
    properties: {
      balanceChangeAmounts: {
        items: {
          $ref: 'BillingBalanceAmount',
        },
        type: 'array',
      },
      billingAccountNumber: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      downPaymentAmount: {
        type: 'number',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      overpaidAmountOption: {
        enum: ['NEXTINSTALLMENTS', 'ALLINSTALLMENTS'],
        type: 'string',
      },
      paymentPlans: {
        items: {
          $ref: 'BillingPaymentPlanRequest',
        },
        type: 'array',
      },
      scheduleEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingInstallmentScheduleStartDatesRequest: {
    properties: {
      billingAccountNumber: {
        type: 'string',
      },
      billingType: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingInstallmentsStartDates: {
    properties: {
      dueDateStartFrom: {
        format: 'date-time',
        type: 'string',
      },
      installmentStartDates: {
        items: {
          format: 'date-time',
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  BillingInvoicePremiumDetails: {
    properties: {
      invoiceNumber: {
        type: 'string',
      },
      masterPolicies: {
        items: {
          $ref: 'BillingPremiumBearingMasterPolicy',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  BillingInvoicePremiumUpdateRequest: {
    properties: {
      premiumUpdate: {
        $ref: 'BillingInvoicePremiumDetails',
      },
      priorPeriodUpdates: {
        items: {
          $ref: 'BillingInvoicePremiumDetails',
        },
        type: 'array',
      },
      transactionData: {
        $ref: 'BillingTransactionData',
      },
    },
    type: 'object',
  },
  BillingModalPremium: {
    properties: {
      amount: {
        type: 'number',
      },
      billingGroupNumber: {
        type: 'string',
      },
      dailyRate: {
        type: 'number',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      premiumPayor: {
        enum: ['SPONSOR', 'MEMBER'],
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingMoneyDetailed: {
    properties: {
      currencyCd: {
        type: 'string',
      },
      details: {
        type: 'object',
      },
      value: {
        type: 'number',
      },
    },
    type: 'object',
  },
  BillingNameInfo: {
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      prefix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingNameInfoDTO: {
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      prefix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingParticipant: {
    properties: {
      certificateNumber: {
        type: 'string',
      },
      fullName: {
        type: 'string',
      },
      participantId: {
        format: 'int',
        type: 'integer',
      },
      premium: {
        $ref: 'AgentMoney',
      },
      rate: {
        type: 'number',
      },
      rateBasis: {
        type: 'string',
      },
      volume: {
        $ref: 'AgentMoney',
      },
    },
    type: 'object',
  },
  BillingPaymentPlan: {
    properties: {
      billType: {
        items: {
          enum: [null, null, null],
          type: 'string',
        },
        type: 'array',
      },
      brands: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      enabledForNewBusiness: {
        type: 'boolean',
      },
      enabledForRenewal: {
        type: 'boolean',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      firstInstallment: {
        type: 'string',
      },
      geography: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      installmentFrequency: {
        format: 'int',
        type: 'integer',
      },
      newBusinessDeposit: {
        type: 'number',
      },
      newBusinessPercent: {
        type: 'number',
      },
      numberInstallments: {
        format: 'int',
        type: 'integer',
      },
      planCd: {
        type: 'string',
      },
      products: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      recurringPaymentsRule: {
        enum: ['ONLYRECURRING', 'ONLYNONRECURRING', 'BOTH'],
        type: 'string',
      },
      renewalPercent: {
        type: 'number',
      },
    },
    type: 'object',
  },
  BillingPaymentPlanRequest: {
    properties: {
      dueDateStartFrom: {
        format: 'date-time',
        type: 'string',
      },
      installmentStartDate: {
        format: 'date-time',
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingPayorDetails: {
    properties: {
      payorAddress: {
        $ref: 'AgentBillingAddress',
      },
      payorNameInfo: {
        $ref: 'BillingNameInfo',
      },
    },
    type: 'object',
  },
  BillingPayorDetailsDTO: {
    properties: {
      payorAddress: {
        $ref: 'BillingAddressDTO',
      },
      payorNameInfo: {
        $ref: 'BillingNameInfoDTO',
      },
    },
    type: 'object',
  },
  BillingPremiumBearingMasterPolicy: {
    properties: {
      coverages: {
        items: {
          $ref: 'BillingSelfAdminCoverage',
        },
        type: 'array',
      },
      policyEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      policyExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BillingRateInfo: {
    properties: {
      benefitAmountOrVolume: {
        type: 'number',
      },
      rate: {
        type: 'number',
      },
    },
    type: 'object',
  },
  BillingSelfAdminCoverage: {
    properties: {
      code: {
        type: 'string',
      },
      definitionInfo: {
        $ref: 'BillingCoverageDefinition',
      },
      policyPackageCd: {
        type: 'string',
      },
      segments: {
        items: {
          $ref: 'BillingCoverageSegment',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  BillingTransactionAllocation: {
    properties: {
      amount: {
        $ref: 'BillingMoneyDetailed',
      },
      balanceDueBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      minimumDueBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      paidBefore: {
        $ref: 'BillingMoneyDetailed',
      },
      policy: {
        $ref: 'AgentPolicyTermSummary',
      },
    },
    type: 'object',
  },
  BillingTransactionData: {
    properties: {
      transactionDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionReason: {
        type: 'string',
      },
      transactionReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  BusinessDetails: {
    properties: {
      businessType: {
        type: 'string',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      entityType: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      groupSponsorInd: {
        type: 'boolean',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      naicsCode: {
        type: 'string',
      },
      numberOfContinuous: {
        format: 'int',
        type: 'integer',
      },
      numberOfEmployees: {
        format: 'int',
        type: 'integer',
      },
      referenceCategories: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      referenceComment: {
        type: 'string',
      },
      sicCode: {
        type: 'string',
      },
      taxExemptInd: {
        type: 'boolean',
      },
      useAsReference: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  CalimCoverage: {
    properties: {
      componentName: {
        type: 'string',
      },
      coverageCd: {
        type: 'string',
      },
      coverageDetails: {
        items: {
          $ref: 'ClaimCoverageDetails',
        },
        type: 'array',
      },
      deductibleAmount: {
        $ref: 'ClaimMoney',
      },
      designatedCoverageInd: {
        type: 'boolean',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Campaign: {
    properties: {
      actualCost: {
        type: 'number',
      },
      autoStart: {
        type: 'boolean',
      },
      budgetCost: {
        type: 'number',
      },
      campaignID: {
        format: 'int',
        type: 'integer',
      },
      categoryCd: {
        type: 'string',
      },
      channels: {
        items: {
          $ref: 'CampaignChannel',
        },
        type: 'array',
      },
      description: {
        type: 'string',
      },
      endDate: {
        format: 'date',
        type: 'string',
      },
      expectedRevenue: {
        type: 'number',
      },
      name: {
        type: 'string',
      },
      owner: {
        $ref: 'AgentCampaignOwner',
      },
      products: {
        items: {
          $ref: 'CampaignProduct',
        },
        type: 'array',
      },
      promotionCd: {
        type: 'string',
      },
      startDate: {
        format: 'date',
        type: 'string',
      },
      status: {
        enum: ['DRAFT', 'INACTIVE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'COMPLETED', 'ARCHIVED'],
        type: 'string',
      },
      suspendFrom: {
        format: 'date',
        type: 'string',
      },
      suspendTo: {
        format: 'date',
        type: 'string',
      },
      targetCharacteristics: {
        $ref: 'AgentCampaignCharacteristics',
      },
      terminationReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CampaignChannel: {
    properties: {
      campaignChannelCd: {
        type: 'string',
      },
      campaignMaterialCd: {
        type: 'string',
      },
      campaignSubChannelCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CampaignProduct: {
    properties: {
      lobCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      riskCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CampaignShortDetails: {
    properties: {
      campaignID: {
        format: 'int',
        type: 'integer',
      },
      name: {
        type: 'string',
      },
      status: {
        enum: ['DRAFT', 'INACTIVE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'COMPLETED', 'ARCHIVED'],
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapAbsenceDetailEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      absenceEventLog: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapAbsenceEventLogEntity',
      },
      absencePeriod: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapAbsencePeriodEntity',
      },
      financialAdjustment: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapFinancialAdjustmentEntity',
      },
      incident: {
        type: 'boolean',
      },
      incidentDate: {
        format: 'date',
        type: 'string',
      },
      lastWorkDate: {
        format: 'date-time',
        type: 'string',
      },
      lossDesc: {
        type: 'string',
      },
      mainCause: {
        type: 'string',
      },
      reportedDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapAbsenceEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      lossDetail: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapAbsenceDetailEntity',
      },
      lossNumber: {
        type: 'string',
      },
      lossPolicyInfo: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapLossPolicyInfoEntity',
      },
      lossSubStatusCd: {
        type: 'string',
      },
      reasonCd: {
        type: 'string',
      },
      reasonDescription: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapAbsenceEventInfoEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      eventPeriod: {
        $ref: 'CapAdjusterAbsenceCapAbsence_Period',
      },
      eventType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapAbsenceEventLogEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      absenceEventInfo: {
        $ref: 'CapAdjusterAbsenceCapAbsence_CapAbsenceEventInfoEntity',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapAbsencePeriodEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      absencePeriod: {
        $ref: 'CapAdjusterAbsenceCapAbsence_Period',
      },
      daysPerWeek: {
        format: 'int',
        type: 'integer',
      },
      fullDay: {
        type: 'boolean',
      },
      hoursPerDay: {
        type: 'number',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapFinancialAdjustmentEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      financialAdjustmentParts: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_CapLossPolicyInfoEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      capPolicyId: {
        type: 'string',
      },
      contactInfo: {
        $ref: 'CapAdjusterAbsenceCapAbsence_ContactInfo',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      insurableRisks: {
        items: {
          $ref: 'CapAdjusterAbsenceCapAbsence_LossInsurableRisk',
        },
        type: 'array',
      },
      insuredFirstName: {
        type: 'string',
      },
      insuredLastName: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_ContactInfo: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      phoneNo: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProvince: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_LossInsurableRisk: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      insurableRiskId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceCapAbsence_Period: {
    properties: {
      _key: {
        $ref: 'CapAdjusterAbsenceEntityKey',
      },
      _type: {
        type: 'string',
      },
      endDate: {
        format: 'date-time',
        type: 'string',
      },
      startDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterAbsenceRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterLossSearchCapLossSearchEntityRequest: {
    properties: {
      embed: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      fields: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      limit: {
        format: 'int',
        type: 'integer',
      },
      offset: {
        format: 'int',
        type: 'integer',
      },
      query: {
        $ref: 'CapAdjusterLossSearchCapLossSearchQuery',
      },
      sort: {
        type: 'object',
      },
    },
    type: 'object',
  },
  CapAdjusterLossSearchCapLossSearchEntityResponse: {
    properties: {
      count: {
        format: 'int',
        type: 'integer',
      },
      result: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  CapAdjusterLossSearchCapLossSearchQuery: {
    properties: {
      lossNumber: {
        $ref: 'CapAdjusterLossSearchCapLossSearchValueMatcher',
      },
      policyNumber: {
        $ref: 'CapAdjusterLossSearchCapLossSearchValueMatcher',
      },
    },
    type: 'object',
  },
  CapAdjusterLossSearchCapLossSearchValueMatcher: {
    properties: {
      from: {
        type: 'string',
      },
      matches: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      notEqual: {
        type: 'string',
      },
      to: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterPolicySearchClaimPolicySearchQuery: {
    properties: {
      capPolicyId: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      effectiveDate: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      expirationDate: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      insuredFirstName: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      insuredLastName: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      insuredRegistryId: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
      policyNumber: {
        $ref: 'CapAdjusterPolicySearchSearchValueMatcher',
      },
    },
    type: 'object',
  },
  CapAdjusterPolicySearchClaimPolicySearchRequest: {
    properties: {
      fields: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      limit: {
        format: 'int',
        type: 'integer',
      },
      offset: {
        format: 'int',
        type: 'integer',
      },
      query: {
        $ref: 'CapAdjusterPolicySearchClaimPolicySearchQuery',
      },
      sort: {
        $ref: 'CapAdjusterPolicySearchClaimPolicySearchSort',
      },
    },
    type: 'object',
  },
  CapAdjusterPolicySearchClaimPolicySearchSort: {
    properties: {
      capPolicyId: {
        type: 'string',
      },
      effectiveDate: {
        type: 'string',
      },
      expirationDate: {
        type: 'string',
      },
      insuredFirstName: {
        type: 'string',
      },
      insuredLastName: {
        type: 'string',
      },
      insuredRegistryId: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterPolicySearchSearchValueMatcher: {
    properties: {
      from: {
        type: 'string',
      },
      matches: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      notEqual: {
        type: 'string',
      },
      to: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapAbsenceInfoEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      claimFinancialAdjustment: {
        $ref: 'CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentEntity',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentDeductionEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      amount: {
        $ref: 'CapAdjusterStdLossMoney',
      },
      deductionBeneficiary: {
        type: 'string',
      },
      deductionTerm: {
        $ref: 'CapAdjusterStdLossCapStd_Term',
      },
      deductionType: {
        type: 'string',
      },
      nonProviderPaymentType: {
        type: 'string',
      },
      prePostTax: {
        type: 'boolean',
      },
      stateProvided: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      claimFinancialAdjustmentDeductions: {
        items: {
          $ref: 'CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentDeductionEntity',
        },
        type: 'array',
      },
      claimFinancialAdjustmentOffsets: {
        items: {
          $ref: 'CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentOffsetEntity',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapClaimFinancialAdjustmentOffsetEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      amount: {
        $ref: 'CapAdjusterStdLossMoney',
      },
      offsetTerm: {
        $ref: 'CapAdjusterStdLossCapStd_Term',
      },
      offsetType: {
        type: 'string',
      },
      prePostTax: {
        type: 'boolean',
      },
      proratingRate: {
        type: 'number',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapDisabilityClaimDetailEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      incidentDate: {
        format: 'date',
        type: 'string',
      },
      lossDesc: {
        type: 'string',
      },
      mainCause: {
        type: 'string',
      },
      reportedDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapDisabilityClaimEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      absence: {
        $ref: 'CapAdjusterStdLossEntityLink',
      },
      capAbsence: {
        $ref: 'CapAdjusterStdLossCapStd_CapAbsenceInfoEntity',
      },
      lossDetail: {
        $ref: 'CapAdjusterStdLossCapStd_CapDisabilityClaimDetailEntity',
      },
      lossNumber: {
        type: 'string',
      },
      lossPolicyInfo: {
        $ref: 'CapAdjusterStdLossCapStd_CapLossPolicyInfoEntity',
      },
      lossSubStatusCd: {
        type: 'string',
      },
      lossType: {
        type: 'string',
      },
      reasonCd: {
        type: 'string',
      },
      reasonDescription: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_CapLossPolicyInfoEntity: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      capPolicyId: {
        type: 'string',
      },
      contactInfo: {
        $ref: 'CapAdjusterStdLossCapStd_ContactInfo',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      insurableRisks: {
        items: {
          $ref: 'CapAdjusterStdLossCapStd_LossInsurableRisk',
        },
        type: 'array',
      },
      insuredFirstName: {
        type: 'string',
      },
      insuredLastName: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_ContactInfo: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      phoneNo: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      stateProvince: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_LossInsurableRisk: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      insurableRiskId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossCapStd_Term: {
    properties: {
      _key: {
        $ref: 'CapAdjusterStdLossEntityKey',
      },
      _type: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CapAdjusterStdLossRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  ClaimCoverageDetails: {
    properties: {
      componentName: {
        type: 'string',
      },
      limitAmount: {
        $ref: 'ClaimMoney',
      },
      limitLevel: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ClaimInsurableRisk: {
    properties: {
      associatedInsurableRiskOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      coverages: {
        items: {
          $ref: 'CalimCoverage',
        },
        type: 'array',
      },
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      party: {
        $ref: 'ClaimParty',
      },
      scheduledItems: {
        items: {
          $ref: 'ClaimInsurableRisk',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  ClaimMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currencyCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ClaimParty: {
    properties: {
      addresses: {
        items: {
          $ref: 'AgentClaimAddress',
        },
        type: 'array',
      },
      birthDt: {
        format: 'date-time',
        type: 'string',
      },
      companyNumber: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      contactPreferenceCd: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'AgentEmail',
        },
        type: 'array',
      },
      extension: {
        type: 'object',
      },
      externalId: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      namePrefix: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      partyNumber: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'AgentPhone',
        },
        type: 'array',
      },
      relationShipToInsuredCd: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'ClaimPartyRole',
        },
        type: 'array',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ClaimPartyRole: {
    properties: {
      claimsPartyRoleCd: {
        type: 'string',
      },
      claimsPartySubRoleCd: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
    },
    type: 'object',
  },
  ClaimPayment: {
    properties: {
      compensationInd: {
        type: 'boolean',
      },
      distributions: {
        items: {
          $ref: 'PaymentDistribution',
        },
        type: 'array',
      },
      extension: {
        type: 'object',
      },
      fromDt: {
        type: 'string',
      },
      grossPaymentAmt: {
        $ref: 'ClaimMoney',
      },
      payableDays: {
        format: 'int',
        type: 'integer',
      },
      payee: {
        $ref: 'PartyRef',
      },
      paymentDetails: {
        $ref: 'PaymentDetails',
      },
      paymentIssueDate: {
        type: 'string',
      },
      paymentMemo: {
        type: 'string',
      },
      paymentNumber: {
        type: 'string',
      },
      paymentStatus: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
      throughDt: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ClaimPolicy: {
    properties: {
      componentName: {
        type: 'string',
      },
      inceptionDate: {
        format: 'date-time',
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'ClaimParty',
        },
        type: 'array',
      },
      policyNumber: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      riskItems: {
        items: {
          $ref: 'ClaimRiskItem',
        },
        type: 'array',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      verified: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  ClaimRiskItem: {
    properties: {
      associatedInsurableRiskOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      coverages: {
        items: {
          $ref: 'CalimCoverage',
        },
        type: 'array',
      },
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      party: {
        $ref: 'ClaimParty',
      },
      reportedRiskItemName: {
        type: 'string',
      },
      scheduledItems: {
        items: {
          $ref: 'ClaimInsurableRisk',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  ClaimsAddress: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressTypeCd: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
      postalCode: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CommonExceptionDTO: {
    properties: {
      errorCode: {
        type: 'string',
      },
      errors: {
        items: {
          $ref: 'ValidationExceptionDTO',
        },
        type: 'array',
      },
      message: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CommunicationActivityDetails: {
    properties: {
      attachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      communicationTypeCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastUpdatedDate: {
        format: 'date',
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performerDescription: {
        type: 'string',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      threadId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  CommunicationActivitySummary: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      communicationTypeCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastUpdatedDate: {
        format: 'date',
        type: 'string',
      },
      performerDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      threadId: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  CommunicationActivityThread: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CommunicationActivityUpdate: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CompletionField: {
    properties: {
      displayValue: {
        type: 'string',
      },
      enumValues: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      readOnly: {
        type: 'boolean',
      },
      required: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ConfigurationBillingType: {
    properties: {
      billingTypeCd: {
        type: 'string',
      },
      billingTypeDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CoverageHeader: {
    properties: {
      coverageCd: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CreatedOpportunitiesSummary: {
    properties: {
      closed: {
        format: 'int',
        type: 'integer',
      },
      closedLostCompetitor: {
        format: 'int',
        type: 'integer',
      },
      closedNoInterest: {
        format: 'int',
        type: 'integer',
      },
      closedOther: {
        format: 'int',
        type: 'integer',
      },
      closedProductNotFit: {
        format: 'int',
        type: 'integer',
      },
      closedWon: {
        format: 'int',
        type: 'integer',
      },
      inPipeline: {
        format: 'int',
        type: 'integer',
      },
      inactive: {
        format: 'int',
        type: 'integer',
      },
      quoted: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  Customer: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      archived: {
        type: 'boolean',
      },
      brandCd: {
        type: 'string',
      },
      businessDetails: {
        $ref: 'BusinessDetails',
      },
      customerNumber: {
        type: 'string',
      },
      customerStatus: {
        type: 'string',
      },
      customerType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      individualDetails: {
        $ref: 'IndividualDetails',
      },
      paperless: {
        type: 'boolean',
      },
      preferredCurrency: {
        type: 'string',
      },
      preferredSpokenLanguageCd: {
        type: 'string',
      },
      preferredWrittenLanguageCd: {
        type: 'string',
      },
      rateDateIntake: {
        type: 'string',
      },
      rateDatePayment: {
        type: 'string',
      },
      ratingCd: {
        type: 'string',
      },
      registeredOnline: {
        type: 'boolean',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sourceCd: {
        type: 'string',
      },
      sourceOfExchangeRate: {
        type: 'string',
      },
    },
    type: 'object',
  },
  CustomerDetails: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      addresses: {
        items: {
          $ref: 'AgentCustomerAddress',
        },
        type: 'array',
      },
      agencies: {
        items: {
          $ref: 'Agency',
        },
        type: 'array',
      },
      archived: {
        type: 'boolean',
      },
      brandCd: {
        type: 'string',
      },
      businessCustomerAdditionalNames: {
        items: {
          $ref: 'AgentBusinessCustomerAdditionalName',
        },
        type: 'array',
      },
      businessDetails: {
        $ref: 'BusinessDetails',
      },
      chats: {
        items: {
          $ref: 'AgentCustomerChat',
        },
        type: 'array',
      },
      customerEmployments: {
        items: {
          $ref: 'AgentCustomerEmploymentInfo',
        },
        type: 'array',
      },
      customerNumber: {
        type: 'string',
      },
      customerStatus: {
        type: 'string',
      },
      customerType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'AgentCustomerEmail',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      genericRelationships: {
        items: {
          $ref: 'AgentCustomerRelationship',
        },
        type: 'array',
      },
      indCustomerAdditionalNames: {
        items: {
          $ref: 'AgentIndividualCustomerAdditionalName',
        },
        type: 'array',
      },
      individualDetails: {
        $ref: 'IndividualDetails',
      },
      navigationLinks: {
        items: {
          $ref: 'AgentCustomerNavigationLink',
        },
        type: 'array',
      },
      paperless: {
        type: 'boolean',
      },
      phones: {
        items: {
          $ref: 'AgentCustomerPhone',
        },
        type: 'array',
      },
      preferredContactMethod: {
        type: 'string',
      },
      preferredCurrency: {
        type: 'string',
      },
      preferredSpokenLanguageCd: {
        type: 'string',
      },
      preferredWrittenLanguageCd: {
        type: 'string',
      },
      providers: {
        items: {
          $ref: 'AgentCustomerServiceProvider',
        },
        type: 'array',
      },
      rateDateIntake: {
        type: 'string',
      },
      rateDatePayment: {
        type: 'string',
      },
      ratingCd: {
        type: 'string',
      },
      registeredOnline: {
        type: 'boolean',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      socialNets: {
        items: {
          $ref: 'AgentCustomerSocialNet',
        },
        type: 'array',
      },
      sourceCd: {
        type: 'string',
      },
      sourceOfExchangeRate: {
        type: 'string',
      },
      webAddresses: {
        items: {
          $ref: 'AgentCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  CustomerWithActiveCampaigns: {
    properties: {
      activeCampaigns: {
        items: {
          $ref: 'CampaignShortDetails',
        },
        type: 'array',
      },
      archived: {
        type: 'boolean',
      },
      brandCd: {
        type: 'string',
      },
      businessDetails: {
        $ref: 'BusinessDetails',
      },
      customerNumber: {
        type: 'string',
      },
      customerStatus: {
        type: 'string',
      },
      customerType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      individualDetails: {
        $ref: 'IndividualDetails',
      },
      paperless: {
        type: 'boolean',
      },
      preferredSpokenLanguageCd: {
        type: 'string',
      },
      preferredWrittenLanguageCd: {
        type: 'string',
      },
      ratingCd: {
        type: 'string',
      },
      registeredOnline: {
        type: 'boolean',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sourceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Damage: {
    properties: {
      componentName: {
        type: 'string',
      },
      damageNumber: {
        type: 'string',
      },
      damageType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      features: {
        items: {
          $ref: 'Feature',
        },
        type: 'array',
      },
      itemizedLosses: {
        items: {
          $ref: 'ItemizedLoss',
        },
        type: 'array',
      },
      loss: {
        $ref: 'Loss',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  DamageHeader: {
    properties: {
      damageNumber: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  DeclinePaymentReason: {
    properties: {
      declinePaymentReasonCd: {
        type: 'string',
      },
      declinePaymentReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Document: {
    properties: {
      actions: {
        type: 'object',
      },
      agencyCd: {
        type: 'string',
      },
      attachmentFullPath: {
        type: 'string',
      },
      attachmentName: {
        type: 'string',
      },
      attachmentType: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      createdBy: {
        $ref: 'UserSummary',
      },
      createdByUserId: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      documentTypeCd: {
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      externalUrl: {
        type: 'string',
      },
      fileComments: {
        type: 'string',
      },
      fileReference: {
        type: 'string',
      },
      fileSize: {
        type: 'string',
      },
      fileType: {
        type: 'string',
      },
      folderId: {
        type: 'string',
      },
      modificationDate: {
        format: 'date-time',
        type: 'string',
      },
      modifiedBy: {
        $ref: 'UserSummary',
      },
      modifiedByUserId: {
        type: 'string',
      },
      uuid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  DownPaymentReason: {
    properties: {
      downPaymentReasonCd: {
        type: 'string',
      },
      downPaymentReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  DueDayConfig: {
    properties: {
      displayValue: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  EmailContact: {
    properties: {
      email: {
        type: 'string',
      },
      emailTypeCd: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  EndpointRequestIds: {
    properties: {
      requestIds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  EntityRef: {
    properties: {
      displayValue: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      entityId: {
        format: 'int',
        type: 'integer',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      properties: {
        type: 'object',
      },
    },
    type: 'object',
  },
  EntityReference: {
    properties: {
      displayValue: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      entityId: {
        format: 'int',
        type: 'integer',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      properties: {
        type: 'object',
      },
    },
    type: 'object',
  },
  ExGratiaDetails: {
    properties: {
      exGratiaDesc: {
        type: 'string',
      },
      exGratiaReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ExcludeCommissions: {
    properties: {
      excludeCommissionsFromBilling: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  Feature: {
    properties: {
      associatedInsurableRisk: {
        $ref: 'InsurableRiskHeader',
      },
      associatedInsurableRiskOid: {
        type: 'string',
      },
      claimant: {
        $ref: 'PartyRef',
      },
      coverage: {
        $ref: 'CoverageHeader',
      },
      coverageDesc: {
        type: 'string',
      },
      coverageOid: {
        type: 'string',
      },
      damage: {
        $ref: 'DamageHeader',
      },
      extension: {
        type: 'object',
      },
      featureId: {
        type: 'string',
      },
      featureIncurred: {
        $ref: 'ClaimMoney',
      },
      featureNumber: {
        type: 'string',
      },
      featureOwner: {
        $ref: 'FileOwner',
      },
      oid: {
        type: 'string',
      },
      reserves: {
        items: {
          $ref: 'Reserve',
        },
        type: 'array',
      },
      statusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  FileOwner: {
    properties: {
      displayValue: {
        type: 'string',
      },
      refId: {
        type: 'string',
      },
      typeCd: {
        enum: ['externalUser', 'internalUser', 'queue'],
        type: 'string',
      },
    },
    type: 'object',
  },
  GatewayHealthCheckResponse: {
    properties: {
      dataproviders: {
        type: 'object',
      },
      gateway: {
        $ref: 'GatewayHealthCheckStatistics',
      },
    },
    type: 'object',
  },
  GatewayHealthCheckStatistics: {
    properties: {
      apiCallsAverageGatewayLatency: {
        format: 'int',
        type: 'integer',
      },
      apiCallsAverageRequestTime: {
        format: 'int',
        type: 'integer',
      },
      apiCallsCompleted: {
        format: 'int',
        type: 'integer',
      },
      apiCallsPending: {
        format: 'int',
        type: 'integer',
      },
      gatewayEndpoints: {
        type: 'object',
      },
      responses: {
        type: 'object',
      },
      uptime: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenerateFutureStatementRequest: {
    properties: {
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      raw: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivity: {
    properties: {
      _key: {
        $ref: 'GenesisActivityKey',
      },
      additionalData: {
        items: {
          $ref: 'GenesisActivityAdditionalData',
        },
        type: 'array',
      },
      entityNumber: {
        type: 'string',
      },
      messageId: {
        type: 'string',
      },
      owningEntity: {
        $ref: 'GenesisLinkDTO',
      },
      status: {
        type: 'string',
      },
      userKey: {
        type: 'string',
      },
      validUntil: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityAdditionalData: {
    properties: {
      name: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityAdditionalDataRequest: {
    properties: {
      additionalData: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisActivityDetails: {
    properties: {
      _key: {
        $ref: 'GenesisActivityKey',
      },
      additionalData: {
        items: {
          $ref: 'GenesisActivityAdditionalData',
        },
        type: 'array',
      },
      dimensions: {
        $ref: 'GenesisActivityDimension',
      },
      entityNumber: {
        type: 'string',
      },
      messageId: {
        type: 'string',
      },
      owningEntity: {
        $ref: 'GenesisLinkDTO',
      },
      status: {
        type: 'string',
      },
      userKey: {
        type: 'string',
      },
      validUntil: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityDimension: {
    properties: {
      dimensionValues: {
        items: {
          $ref: 'GenesisActivityDimensionValue',
        },
        type: 'array',
      },
      entityType: {
        type: 'string',
      },
      modelName: {
        type: 'string',
      },
      modelVersion: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityDimensionValue: {
    properties: {
      dimensionValues: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      dimensionsCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityKey: {
    properties: {
      category: {
        type: 'string',
      },
      entityId: {
        type: 'string',
      },
      group: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      timestamp: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisActivityUpdateRequest: {
    properties: {
      activities: {
        items: {
          $ref: 'GenesisActivityDetails',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAdditionalInterest: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisPolicyAddress',
      },
      email: {
        type: 'string',
      },
      loanAmt: {
        $ref: 'GenesisMoney',
      },
      loanNo: {
        type: 'string',
      },
      lossPayeeExpDate: {
        format: 'date',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      rank: {
        type: 'string',
      },
      secondName: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideApplicabilityOverrideAcceptRequest: {
    properties: {
      acceptReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideApplicabilityOverrideDeclineRequest: {
    properties: {
      declineReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideApplicabilityOverrideInitRequest: {
    properties: {
      policy: {
        $ref: 'GenesisAgentPolicyApplicabilityOverrideEntityLink',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverridePolicyApplicabilityOverride_ApplicabilityOverrideAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyApplicabilityOverrideEntityKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverridePolicyApplicabilityOverride_PolicyApplicabilityOverride: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyApplicabilityOverrideRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      acceptReason: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAgentPolicyApplicabilityOverridePolicyApplicabilityOverride_ApplicabilityOverrideAccessTrackInfo',
      },
      applicabilityAction: {
        type: 'string',
      },
      applicabilityType: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entryPoint: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      overriddenEntityId: {
        type: 'string',
      },
      overriddenEntityType: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      policy: {
        $ref: 'GenesisAgentPolicyApplicabilityOverrideEntityLink',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyApplicabilityOverrideRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoAutoRollOnRequest: {
    properties: {
      diffConflictResolutions: {
        items: {
          $ref: 'GenesisAgentPolicyAutoDiffConflictResolution',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoCancelNoticeRequest: {
    properties: {
      cancelNoticeDate: {
        format: 'date-time',
        type: 'string',
      },
      cancelNoticeDays: {
        format: 'int',
        type: 'integer',
      },
      cancelNoticeOtherReason: {
        type: 'string',
      },
      cancelNoticeReason: {
        type: 'string',
      },
      printNotice: {
        type: 'boolean',
      },
      supportingData: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoCommandImpactRequest: {
    properties: {
      commandName: {
        type: 'string',
      },
      embed: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      fields: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoCommandImpactResponse: {
    properties: {
      resultTxType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoCopyFromPolicyRequest: {
    properties: {
      archivedAtPolicyRevision: {
        format: 'int',
        type: 'integer',
      },
      customer: {
        $ref: 'GenesisAgentPolicyAutoEntityLink',
      },
      targetAgency: {
        type: 'string',
      },
      targetAgent: {
        type: 'string',
      },
      targetBrand: {
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoCreateVersionRequest: {
    properties: {
      termDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoTermDetails',
      },
      transactionDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoTransactionDetails',
      },
      variation: {
        type: 'string',
      },
      versionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDecisionModel: {
    properties: {
      modelType: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      tables: {
        type: 'object',
      },
      variations: {
        items: {
          $ref: 'GenesisAgentPolicyAutoVariation',
        },
        type: 'array',
      },
      version: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDecisionTableDataResponse: {
    properties: {
      rows: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      tableName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDeclineQuoteRequest: {
    properties: {
      declineDate: {
        format: 'date-time',
        type: 'string',
      },
      declineOtherReason: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDiff: {
    properties: {
      operationType: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      readOnly: {
        type: 'boolean',
      },
      sourceValue: {
        type: 'object',
      },
      targetValue: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDiffConflict: {
    properties: {
      currentDiff: {
        $ref: 'GenesisAgentPolicyAutoDiff',
      },
      futureDiff: {
        $ref: 'GenesisAgentPolicyAutoDiff',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDiffConflictResolution: {
    properties: {
      resolution: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDiffPatch: {
    properties: {
      conflictingDiffs: {
        items: {
          $ref: 'GenesisAgentPolicyAutoDiffConflict',
        },
        type: 'array',
      },
      diffs: {
        items: {
          $ref: 'GenesisAgentPolicyAutoDiff',
        },
        type: 'array',
      },
      targetPayload: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDimensionResolutionResponse: {
    properties: {
      dimensions: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoDoNotRenewRequest: {
    properties: {
      doNotRenewOtherReason: {
        type: 'string',
      },
      doNotRenewReason: {
        type: 'string',
      },
      doNotRenewStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEligibilityEntry: {
    properties: {
      entityId: {
        format: 'uuid',
        type: 'string',
      },
      errorCode: {
        type: 'string',
      },
      errorSeverity: {
        type: 'string',
      },
      isEligible: {
        type: 'boolean',
      },
      ruleName: {
        type: 'string',
      },
      value: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEndorseRequest: {
    properties: {
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEntityManagerMetadata: {
    properties: {
      applicabilityType: {
        type: 'string',
      },
      applicableEntityName: {
        type: 'string',
      },
      attributes: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEntryPointBundle: {
    properties: {
      evaluation: {
        $ref: 'GenesisAgentPolicyAutoEntryPointEvaluation',
      },
      expressionContext: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoEntryPointEvaluation: {
    properties: {
      entryPointName: {
        type: 'string',
      },
      rules: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoFlowDefinition: {
    properties: {
      callFacadeInParallel: {
        type: 'boolean',
      },
      flow: {
        items: {
          $ref: 'GenesisAgentPolicyAutoFlowOperations',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoFlowOperations: {
    properties: {
      operations: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoImportDecisionTableModelRequest: {
    properties: {
      tableDSL: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoIssueRequestRequest: {
    properties: {
      billingInfo: {
        type: 'object',
      },
      billingUri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoJsonEntityRef: {
    properties: {
      _ref: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoManualRenewRequest: {
    properties: {
      manualRenewOtherReason: {
        type: 'string',
      },
      manualRenewReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoAspectEvaluationRequest: {
    properties: {
      dimensions: {
        $ref: 'GenesisAgentPolicyAutoPersonalAutoDimensions',
      },
      parameters: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoDimensions: {
    properties: {
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      rateEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      revision: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoDynamicPremiumDetails: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      premiumEntries: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAutoPremiumEntry',
        },
        type: 'array',
      },
      premiumHolderAttributes: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAutoPremiumHolderAttribute',
        },
        type: 'array',
      },
      premiumHolderCode: {
        type: 'string',
      },
      premiumHolderType: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      totals: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAutoTotalsEntry',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoKrakenBundleRequest: {
    properties: {
      dimensions: {
        $ref: 'GenesisAgentPolicyAutoPersonalAutoDimensions',
      },
      parameters: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoPremiumEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      addedAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      factor: {
        type: 'number',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      returnedAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      reversedAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoPremiumHolderAttribute: {
    properties: {
      attributeData: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      attributeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoTableEvaluationRequest: {
    properties: {
      dimensions: {
        $ref: 'GenesisAgentPolicyAutoPersonalAutoDimensions',
      },
      parameters: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAutoTotalsEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      raw: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoAdditionalInterestInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo',
      },
      email: {
        type: 'string',
      },
      loanAmt: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      loanNo: {
        type: 'string',
      },
      lossPayeeExpDate: {
        format: 'date',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      rank: {
        type: 'string',
      },
      secondName: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      geoposition: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoGeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
      streetAddress: {
        type: 'string',
      },
      streetName: {
        type: 'string',
      },
      streetNumber: {
        type: 'string',
      },
      unitNumber: {
        type: 'string',
      },
      zipPlus4Code: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoBLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      blobCd: {
        type: 'string',
      },
      lobs: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoLOB',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoBankAccountInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      routingNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoBillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo',
      },
      bankAccountInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoBankAccountInfo',
      },
      communicationInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoCommunicationInfo',
      },
      creditCardInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoCreditCardInfo',
      },
      paperless: {
        type: 'boolean',
      },
      paymentAmt: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      paymentAuthorized: {
        type: 'boolean',
      },
      paymentMethod: {
        type: 'string',
      },
      recurringPayment: {
        type: 'boolean',
      },
      sameBillingAddress: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoBusinessDimensions: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoClaimInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      claimAssociation: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatus: {
        type: 'string',
      },
      claimType: {
        type: 'string',
      },
      dateOfLoss: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      lossType: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      totalClaimCost: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoCommunicationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoEmailInfo',
        },
        type: 'array',
      },
      phones: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPhoneInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoCreditCardInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      cardNumber: {
        type: 'string',
      },
      cardType: {
        type: 'string',
      },
      cvv: {
        type: 'number',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoCreditScoreInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      isCompanyAlert: {
        type: 'boolean',
      },
      ofacClearance: {
        type: 'boolean',
      },
      score: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoDocumentDeliveryOptions: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      deliveryMethod: {
        type: 'string',
      },
      divert: {
        type: 'boolean',
      },
      divertTo: {
        type: 'string',
      },
      divertType: {
        type: 'string',
      },
      noGenerationType: {
        type: 'string',
      },
      noPrintType: {
        type: 'string',
      },
      paymentPlanAuth: {
        type: 'string',
      },
      policyApplication: {
        type: 'boolean',
      },
      suppressGeneration: {
        type: 'boolean',
      },
      suppressPrint: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoDriverFillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      caseNumber: {
        type: 'string',
      },
      date: {
        format: 'date',
        type: 'string',
      },
      needed: {
        type: 'boolean',
      },
      reason: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoDriverInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoClaimInfo',
        },
        type: 'array',
      },
      companyEmployee: {
        type: 'boolean',
      },
      companyEmployeeNumber: {
        type: 'string',
      },
      continuouslyWithCompany: {
        format: 'date',
        type: 'string',
      },
      convictedOfFelonyInd: {
        type: 'boolean',
      },
      driverType: {
        type: 'string',
      },
      fillingInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoDriverFillingInfo',
      },
      included: {
        type: 'boolean',
      },
      licenseInfo: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoLicenseInfo',
        },
        type: 'array',
      },
      prefilled: {
        type: 'boolean',
      },
      reasonForExclusion: {
        type: 'string',
      },
      reportsOrdered: {
        type: 'boolean',
      },
      studentInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoStudentInfo',
      },
      suspensions: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoSuspensionInfo',
        },
        type: 'array',
      },
      trainingCompletionDate: {
        format: 'date',
        type: 'string',
      },
      underwritingInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoDriverUnderwritingInfo',
      },
      violations: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoViolationInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoDriverUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      driverTraining: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      isChildrenCustody: {
        type: 'boolean',
      },
      isFelonyConvicted: {
        type: 'boolean',
      },
      isIncomeFarmingDerived: {
        type: 'boolean',
      },
      isLivingWithParents: {
        type: 'boolean',
      },
      isOnParentsPolicy: {
        type: 'boolean',
      },
      isParentsInsuredRelatedCompany: {
        type: 'boolean',
      },
      residentFor: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoEmailInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoGeoCoord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoInsuredInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      clueReport: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoReportInfo',
      },
      mvrReport: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoReportInfo',
      },
      personalAutoInsuredMembership: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoInsuredMembership',
      },
      primary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      lobCd: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      riskItems: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoVehicle',
        },
        type: 'array',
      },
      sequences: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoSequences',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoLicenseInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      ageFirstLicensed: {
        format: 'int',
        type: 'integer',
      },
      dateFirstLicensed: {
        format: 'date',
        type: 'string',
      },
      dateLicensed: {
        format: 'date',
        type: 'string',
      },
      licenseClass: {
        type: 'string',
      },
      licenseNumber: {
        type: 'string',
      },
      licenseStateCd: {
        type: 'string',
      },
      licenseStatusCd: {
        type: 'string',
      },
      licenseTypeCd: {
        type: 'string',
      },
      permitBeforeLicense: {
        type: 'boolean',
      },
      revocationPending: {
        type: 'boolean',
      },
      totalDriverExpYears: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPackagingDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      declineVariationInd: {
        type: 'boolean',
      },
      declineVariationReason: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPartyRole: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      role: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPaymentPlan: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      dueDate: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPersonEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoCommunicationInfo',
        },
        type: 'array',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      legalIdentities: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPolicyPersonLegalIdentity',
        },
        type: 'array',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPhoneInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPolicyDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      archivedAtPolicyRevision: {
        format: 'int',
        type: 'integer',
      },
      cancelNotice: {
        type: 'boolean',
      },
      cancelNoticeDate: {
        format: 'date-time',
        type: 'string',
      },
      cancelNoticeDays: {
        format: 'int',
        type: 'integer',
      },
      cancelNoticeOtherReason: {
        type: 'string',
      },
      cancelNoticeReason: {
        type: 'string',
      },
      currentQuoteInd: {
        type: 'boolean',
      },
      declineDate: {
        format: 'date-time',
        type: 'string',
      },
      declineOtherReason: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      doNotRenew: {
        type: 'boolean',
      },
      doNotRenewOtherReason: {
        type: 'string',
      },
      doNotRenewReason: {
        type: 'string',
      },
      doNotRenewStatus: {
        type: 'string',
      },
      followUpRequired: {
        type: 'boolean',
      },
      manualRenew: {
        type: 'boolean',
      },
      manualRenewOtherReason: {
        type: 'string',
      },
      manualRenewReason: {
        type: 'string',
      },
      oosProcessingStage: {
        type: 'string',
      },
      printNotice: {
        type: 'boolean',
      },
      proposeNotes: {
        type: 'string',
      },
      supportingData: {
        type: 'string',
      },
      suspendDate: {
        format: 'date-time',
        type: 'string',
      },
      suspendOtherReason: {
        type: 'string',
      },
      suspendReason: {
        type: 'string',
      },
      versionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPolicyPerson: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo',
        },
        type: 'array',
      },
      age: {
        format: 'int',
        type: 'integer',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPersonEntity',
      },
      salutation: {
        type: 'string',
      },
      sameHomeAddress: {
        type: 'boolean',
      },
      ssn: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPolicyPersonLegalIdentity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      legalIdentityType: {
        type: 'string',
      },
      legalIdentityValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPrefillInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      gender: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
      policyState: {
        type: 'string',
      },
      skipped: {
        type: 'boolean',
      },
      used: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoPriorCarrierInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      carrierCd: {
        type: 'string',
      },
      carrierName: {
        type: 'string',
      },
      carrierPolicyExpDate: {
        format: 'date',
        type: 'string',
      },
      carrierPolicyNo: {
        type: 'string',
      },
      carrierPremium: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      deductibles: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      limitsBiPd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoReportInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      bandNumber: {
        type: 'string',
      },
      order: {
        type: 'boolean',
      },
      orderDate: {
        format: 'date',
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
      receiptDate: {
        format: 'date',
        type: 'string',
      },
      reorder: {
        type: 'boolean',
      },
      response: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoSequences: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      collection: {
        type: 'string',
      },
      max: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoStudentInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      awayAtSchool: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      over100MilesFromHome: {
        type: 'boolean',
      },
      publicTransportationDiscount: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoSuspensionInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      reinstatementDate: {
        format: 'date',
        type: 'string',
      },
      suspensionDate: {
        format: 'date',
        type: 'string',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoTermDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      contractTermTypeCd: {
        type: 'string',
      },
      termCd: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      termNo: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoTransactionDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      txCreateDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
      txType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoVehicle: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      additionalInterests: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAdditionalInterestInfo',
        },
        type: 'array',
      },
      adjustedValue: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      adjustmentToValue: {
        type: 'number',
      },
      annualMiles: {
        format: 'int',
        type: 'integer',
      },
      assignedDrivers: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoVehicleDriver',
        },
        type: 'array',
      },
      biSymbol: {
        type: 'string',
      },
      businessUseDescription: {
        type: 'string',
      },
      businessUseInd: {
        type: 'boolean',
      },
      costNew: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      coverageGroups: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      damageDescription: {
        type: 'string',
      },
      declaredAnnualMiles: {
        format: 'int',
        type: 'integer',
      },
      distanceForPleasurePerWeek: {
        format: 'int',
        type: 'integer',
      },
      distanceOneWay: {
        format: 'int',
        type: 'integer',
      },
      existingDamage: {
        type: 'boolean',
      },
      farmOrRanchDisc: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      garageParked: {
        type: 'boolean',
      },
      garagingAddress: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAddressInfo',
      },
      included: {
        type: 'boolean',
      },
      isGaragingAddressSameAsInsured: {
        type: 'boolean',
      },
      isKitCar: {
        type: 'boolean',
      },
      liabSymbol: {
        type: 'string',
      },
      marketValue: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      marketValueOriginal: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      marketValueOverride: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      numDaysDrivenPerWeek: {
        format: 'int',
        type: 'integer',
      },
      odometerReading: {
        format: 'int',
        type: 'integer',
      },
      odometerReadingDate: {
        format: 'date',
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      pdSymbol: {
        type: 'string',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      pipMedSymbol: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      plateNumber: {
        type: 'string',
      },
      prefilled: {
        type: 'boolean',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      registeredAtDmv: {
        type: 'boolean',
      },
      registeredOwner: {
        $ref: 'GenesisAgentPolicyAutoJsonEntityRef',
      },
      registeredStateCd: {
        type: 'string',
      },
      registrationType: {
        type: 'string',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      series: {
        type: 'string',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      statedAmt: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicleBaseDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoVehicleEntity',
      },
      vehicleUnderwritingInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_VehicleUnderwritingInfo',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoVehicleDriver: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      assignDriverType: {
        type: 'string',
      },
      driver: {
        $ref: 'GenesisAgentPolicyAutoJsonEntityRef',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
      percentOfUsage: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoVehicleEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      adjustedValue: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      adjustmentToValue: {
        type: 'number',
      },
      airBagStatusCd: {
        type: 'string',
      },
      antiLockBrakeCd: {
        type: 'string',
      },
      armoredInd: {
        type: 'boolean',
      },
      automaticBeltsInd: {
        type: 'boolean',
      },
      bodyTypeCd: {
        type: 'string',
      },
      collSymbol: {
        type: 'string',
      },
      compSymbol: {
        type: 'string',
      },
      costNew: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      daytimeRunningLampsInd: {
        type: 'boolean',
      },
      enginePower: {
        format: 'int',
        type: 'integer',
      },
      firstRegistrationYear: {
        format: 'int',
        type: 'integer',
      },
      fuelTypeCd: {
        type: 'string',
      },
      make: {
        type: 'string',
      },
      manufactureYear: {
        format: 'int',
        type: 'integer',
      },
      marketValue: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
      model: {
        type: 'string',
      },
      modelYear: {
        format: 'int',
        type: 'integer',
      },
      noVinReasonCd: {
        type: 'string',
      },
      performanceCd: {
        type: 'string',
      },
      purchasedDate: {
        format: 'date',
        type: 'string',
      },
      purchasedNew: {
        type: 'boolean',
      },
      recoveryDeviceInd: {
        type: 'boolean',
      },
      registrationRecords: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoVehicleRegistrationRecord',
        },
        type: 'array',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      securityOptionsCd: {
        type: 'string',
      },
      seriesCd: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
      usageCd: {
        type: 'string',
      },
      vehSymbol: {
        type: 'string',
      },
      vehicleIdentificationNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoVehicleRegistrationRecord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      licensePlateNumber: {
        type: 'string',
      },
      registrationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_AutoViolationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      convictionDate: {
        format: 'date',
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_PersonalAutoInsuredMembership: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      membershipNo: {
        format: 'int',
        type: 'integer',
      },
      organizationCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicyParty: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      creditScoreInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoCreditScoreInfo',
      },
      driverInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoDriverInfo',
      },
      insuredInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoInsuredInfo',
      },
      personInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPolicyPerson',
      },
      priorCarrierInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPriorCarrierInfo',
      },
      relationToPrimaryInsured: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPartyRole',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicySummary: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _sagaId: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      _variation: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoAccessTrackInfo',
      },
      billingAccount: {
        type: 'string',
      },
      billingInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoBillingInfo',
      },
      blob: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoBLOB',
      },
      bookrollId: {
        type: 'string',
      },
      businessDimensions: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoBusinessDimensions',
      },
      country: {
        type: 'string',
      },
      createdFromPolicyRev: {
        format: 'int',
        type: 'integer',
      },
      createdFromQuoteRev: {
        format: 'int',
        type: 'integer',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyAutoEntityLink',
      },
      document: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoDocumentDeliveryOptions',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      inceptionDate: {
        format: 'date-time',
        type: 'string',
      },
      methodOfDelivery: {
        type: 'string',
      },
      notes: {
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideRateEffectiveDate: {
        type: 'boolean',
      },
      packagingDetail: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPackagingDetail',
      },
      parties: {
        items: {
          $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicyParty',
        },
        type: 'array',
      },
      paymentPlan: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPaymentPlan',
      },
      policyDetail: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPolicyDetail',
      },
      policyFormCd: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policySource: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      preConvPolicyNumber: {
        type: 'string',
      },
      preConvPolicyPremium: {
        type: 'string',
      },
      prefillInfo: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoPrefillInfo',
      },
      premiums: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      productCd: {
        type: 'string',
      },
      rateEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      sendTo: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoTermDetails',
      },
      transactionDetails: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_AutoTransactionDetails',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPersonalAuto_VehicleUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoEntityKey',
      },
      _type: {
        type: 'string',
      },
      isAutoSalesAgency: {
        type: 'boolean',
      },
      isCompanyCar: {
        type: 'boolean',
      },
      isEmergencyServices: {
        type: 'boolean',
      },
      isOfficeUse: {
        type: 'boolean',
      },
      isParkingOperations: {
        type: 'boolean',
      },
      isPublicTransportation: {
        type: 'boolean',
      },
      isRacing: {
        type: 'boolean',
      },
      isRentalToOthers: {
        type: 'boolean',
      },
      isRepairServiceStation: {
        type: 'boolean',
      },
      isVehicleCommercialUsed: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPipeflowRequest: {
    properties: {
      callFacadeInParallel: {
        type: 'boolean',
      },
      flowDefinition: {
        $ref: 'GenesisAgentPolicyAutoFlowDefinition',
      },
      pipeflow: {
        type: 'string',
      },
      request: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoPolicyCancelRequest: {
    properties: {
      supportingData: {
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoQuoteCopyRequest: {
    properties: {
      customer: {
        $ref: 'GenesisAgentPolicyAutoEntityLink',
      },
      targetAgency: {
        type: 'string',
      },
      targetAgent: {
        type: 'string',
      },
      targetBrand: {
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoQuoteInitRequest: {
    properties: {
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyAutoEntityLink',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoQuoteSuspendRequest: {
    properties: {
      followUpRequired: {
        type: 'boolean',
      },
      suspendDate: {
        format: 'date-time',
        type: 'string',
      },
      suspendOtherReason: {
        type: 'string',
      },
      suspendReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRate: {
    properties: {
      type: {
        type: 'string',
      },
      value: {
        $ref: 'GenesisAgentPolicyAutoMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRateAggregate: {
    properties: {
      key: {
        $ref: 'GenesisAgentPolicyAutoRateAggregateKey',
      },
      rateEntries: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRateEntry',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRateAggregateKey: {
    properties: {
      policyId: {
        format: 'uuid',
        type: 'string',
      },
      policyRevisionNo: {
        format: 'int',
        type: 'integer',
      },
      premiumHolderId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRateEntry: {
    properties: {
      attributes: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRateEntryAttribute',
        },
        type: 'array',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'string',
      },
      rate: {
        $ref: 'GenesisAgentPolicyAutoRate',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRateEntryAttribute: {
    properties: {
      attributeName: {
        type: 'string',
      },
      attributeValue: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoResolveManagerRequest: {
    properties: {
      quote: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicySummary',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRewritePolicyRequest: {
    properties: {
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      useOriginalNumber: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRollBackRequest: {
    properties: {
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRollOnRequest: {
    properties: {
      diffs: {
        items: {
          $ref: 'GenesisAgentPolicyAutoDiff',
        },
        type: 'array',
      },
      rollOnTarget: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicySummary',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRuleOverrideAction: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      duration: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityId: {
        format: 'uuid',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRuleOverrideEligibilityStatus: {
    properties: {
      eligibleEntries: {
        items: {
          $ref: 'GenesisAgentPolicyAutoEligibilityEntry',
        },
        type: 'array',
      },
      overriddenFacts: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRuleOverrideFact',
        },
        type: 'array',
      },
      pendingEligibleFacts: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRuleOverrideFact',
        },
        type: 'array',
      },
      pendingReferableFacts: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRuleOverrideFact',
        },
        type: 'array',
      },
      referableEntries: {
        items: {
          $ref: 'GenesisAgentPolicyAutoEligibilityEntry',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRuleOverrideFact: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      duration: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityId: {
        format: 'uuid',
        type: 'string',
      },
      errorCode: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      overriddenValue: {
        type: 'object',
      },
      overrideReason: {
        type: 'string',
      },
      rootEntityId: {
        format: 'uuid',
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      timestamp: {
        format: 'date-time',
        type: 'string',
      },
      userId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoRuleOverrideRequest: {
    properties: {
      entryPoint: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisAgentPolicyAutoEntityLink',
      },
      overrides: {
        items: {
          $ref: 'GenesisAgentPolicyAutoRuleOverrideAction',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoUpdateRequest: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyAutoRootEntityKey',
      },
      quote: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicySummary',
      },
      userOperations: {
        items: {
          $ref: 'GenesisAgentPolicyAutoUserOperation',
        },
        type: 'array',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoUserOperation: {
    properties: {
      entity: {
        type: 'object',
      },
      path: {
        type: 'string',
      },
      userOperationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyAutoVariation: {
    properties: {
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetBaseKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetCommandImpactRequest: {
    properties: {
      commandName: {
        type: 'string',
      },
      embed: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      fields: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetCommandImpactResponse: {
    properties: {
      resultTxType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetDetachRequest: {
    properties: {
      detachedEntity: {
        $ref: 'GenesisAgentPolicyFleetIdentifiableEntity',
      },
      embed: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetEndorseRequest: {
    properties: {
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetEntityManagerMetadata: {
    properties: {
      applicabilityType: {
        type: 'string',
      },
      applicableEntityName: {
        type: 'string',
      },
      attributes: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoDimensions: {
    properties: {
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      coverageType: {
        type: 'string',
      },
      grouped: {
        type: 'boolean',
      },
      rateEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      revision: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoDynamicPremiumDetails: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      premiumEntries: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAutoPremiumEntry',
        },
        type: 'array',
      },
      premiumHolderAttributes: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAutoPremiumHolderAttribute',
        },
        type: 'array',
      },
      premiumHolderCode: {
        type: 'string',
      },
      premiumHolderType: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      totals: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAutoTotalsEntry',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoPremiumEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      addedAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      factor: {
        type: 'number',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      returnedAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      reversedAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoPremiumHolderAttribute: {
    properties: {
      attributeData: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      attributeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoTableEvaluationRequest: {
    properties: {
      dimensions: {
        $ref: 'GenesisAgentPolicyFleetFleetAutoDimensions',
      },
      parameters: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAutoTotalsEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      raw: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoBLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      blobCd: {
        type: 'string',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      lobs: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoLOB',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoBusinessDimensions: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoClaimInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      claimAssociation: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatus: {
        type: 'string',
      },
      claimType: {
        type: 'string',
      },
      dateOfLoss: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      lossType: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      totalClaimCost: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoCommunicationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoEmailInfo',
        },
        type: 'array',
      },
      phones: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPhoneInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoCreditScoreInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      isCompanyAlert: {
        type: 'boolean',
      },
      ofacClearance: {
        type: 'boolean',
      },
      score: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoDriverFillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      caseNumber: {
        type: 'string',
      },
      date: {
        format: 'date',
        type: 'string',
      },
      needed: {
        type: 'boolean',
      },
      reason: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoDriverInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoClaimInfo',
        },
        type: 'array',
      },
      companyEmployee: {
        type: 'boolean',
      },
      companyEmployeeNumber: {
        type: 'string',
      },
      continuouslyWithCompany: {
        format: 'date',
        type: 'string',
      },
      convictedOfFelonyInd: {
        type: 'boolean',
      },
      driverType: {
        type: 'string',
      },
      fillingInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoDriverFillingInfo',
      },
      included: {
        type: 'boolean',
      },
      licenseInfo: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoLicenseInfo',
        },
        type: 'array',
      },
      reportsOrdered: {
        type: 'boolean',
      },
      studentInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoStudentInfo',
      },
      suspensions: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoSuspensionInfo',
        },
        type: 'array',
      },
      trainingCompletionDate: {
        format: 'date',
        type: 'string',
      },
      underwritingInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoDriverUnderwritingInfo',
      },
      violations: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoViolationInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoDriverUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      driverTraining: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      isChildrenCustody: {
        type: 'boolean',
      },
      isFelonyConvicted: {
        type: 'boolean',
      },
      isIncomeFarmingDerived: {
        type: 'boolean',
      },
      isLivingWithParents: {
        type: 'boolean',
      },
      isOnParentsPolicy: {
        type: 'boolean',
      },
      isParentsInsuredRelatedCompany: {
        type: 'boolean',
      },
      residentFor: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoEmailInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoGeoCoord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoInsuredInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      clueReport: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoReportInfo',
      },
      mvrReport: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoReportInfo',
      },
      personalAutoInsuredMembership: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_PersonalAutoInsuredMembership',
      },
      primary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      lobCd: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      riskItems: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAuto',
        },
        type: 'array',
      },
      sequences: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoSequences',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoLicenseInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      ageFirstLicensed: {
        format: 'int',
        type: 'integer',
      },
      dateFirstLicensed: {
        format: 'date',
        type: 'string',
      },
      dateLicensed: {
        format: 'date',
        type: 'string',
      },
      licenseClass: {
        type: 'string',
      },
      licenseNumber: {
        type: 'string',
      },
      licenseStateCd: {
        type: 'string',
      },
      licenseStatusCd: {
        type: 'string',
      },
      licenseTypeCd: {
        type: 'string',
      },
      permitBeforeLicense: {
        type: 'boolean',
      },
      revocationPending: {
        type: 'boolean',
      },
      totalDriverExpYears: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoOrganizationEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoCommunicationInfo',
        },
        type: 'array',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      publicName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      taxIdentificationId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPackagingDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      declineVariationInd: {
        type: 'boolean',
      },
      declineVariationReason: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPartyRole: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      role: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPersonEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoCommunicationInfo',
        },
        type: 'array',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      legalIdentities: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPolicyPersonLegalIdentity',
        },
        type: 'array',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPhoneInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPolicyDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      archivedAtPolicyRevision: {
        format: 'int',
        type: 'integer',
      },
      cancelNotice: {
        type: 'boolean',
      },
      cancelNoticeDate: {
        format: 'date-time',
        type: 'string',
      },
      cancelNoticeDays: {
        format: 'int',
        type: 'integer',
      },
      cancelNoticeOtherReason: {
        type: 'string',
      },
      cancelNoticeReason: {
        type: 'string',
      },
      currentQuoteInd: {
        type: 'boolean',
      },
      declineDate: {
        format: 'date-time',
        type: 'string',
      },
      declineOtherReason: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      doNotRenew: {
        type: 'boolean',
      },
      doNotRenewOtherReason: {
        type: 'string',
      },
      doNotRenewReason: {
        type: 'string',
      },
      doNotRenewStatus: {
        type: 'string',
      },
      followUpRequired: {
        type: 'boolean',
      },
      manualRenew: {
        type: 'boolean',
      },
      manualRenewOtherReason: {
        type: 'string',
      },
      manualRenewReason: {
        type: 'string',
      },
      oosProcessingStage: {
        type: 'string',
      },
      printNotice: {
        type: 'boolean',
      },
      proposeNotes: {
        type: 'string',
      },
      supportingData: {
        type: 'string',
      },
      suspendDate: {
        format: 'date-time',
        type: 'string',
      },
      suspendOtherReason: {
        type: 'string',
      },
      suspendReason: {
        type: 'string',
      },
      versionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPolicyOrganization: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAddressInfo',
      },
      organizationInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoOrganizationEntity',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPolicyPerson: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAddressInfo',
        },
        type: 'array',
      },
      age: {
        format: 'int',
        type: 'integer',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPersonEntity',
      },
      salutation: {
        type: 'string',
      },
      sameHomeAddress: {
        type: 'boolean',
      },
      ssn: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPolicyPersonLegalIdentity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      legalIdentityType: {
        type: 'string',
      },
      legalIdentityValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoPriorCarrierInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      carrierCd: {
        type: 'string',
      },
      carrierName: {
        type: 'string',
      },
      carrierPolicyExpDate: {
        format: 'date',
        type: 'string',
      },
      carrierPolicyNo: {
        type: 'string',
      },
      carrierPremium: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      deductibles: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      limitsBiPd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoReportInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      bandNumber: {
        type: 'string',
      },
      order: {
        type: 'boolean',
      },
      orderDate: {
        format: 'date',
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
      receiptDate: {
        format: 'date',
        type: 'string',
      },
      reorder: {
        type: 'boolean',
      },
      response: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoSequences: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      collection: {
        type: 'string',
      },
      max: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoStudentInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      awayAtSchool: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      over100MilesFromHome: {
        type: 'boolean',
      },
      publicTransportationDiscount: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoSuspensionInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      reinstatementDate: {
        format: 'date',
        type: 'string',
      },
      suspensionDate: {
        format: 'date',
        type: 'string',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoTermDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      contractTermTypeCd: {
        type: 'string',
      },
      termCd: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      termNo: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoTransactionDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      txCreateDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
      txType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoVehicleDriver: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      assignDriverType: {
        type: 'string',
      },
      driver: {
        $ref: 'GenesisAgentPolicyFleetJsonEntityRef',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
      percentOfUsage: {
        type: 'number',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      totalNumberOfDrivers: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoVehicleRegistrationRecord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      licensePlateNumber: {
        type: 'string',
      },
      registrationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_AutoViolationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      convictionDate: {
        format: 'date',
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetAddressInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoGeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetAuto: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoClaimInfo',
        },
        type: 'array',
      },
      code: {
        type: 'string',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      fleetHistory: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoHistory',
      },
      fleetUnderwritingInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetUnderwritingInfo',
      },
      forms: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_ReplacementCostEndorsement',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      sequences: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoSequences',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      totalNumberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicles: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetIndividualVehicle',
        },
        type: 'array',
      },
      vehiclesGroups: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_VehicleGroup',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetAutoHistory: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      numberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast2Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast3Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast4Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPastYear: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicyParty: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      creditScoreInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoCreditScoreInfo',
      },
      driverInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoDriverInfo',
      },
      insuredInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoInsuredInfo',
      },
      organizationInfoDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPolicyOrganization',
      },
      partyInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPolicyPerson',
      },
      personInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_PolicyPerson',
      },
      priorCarrierInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPriorCarrierInfo',
      },
      relationToPrimaryInsured: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPartyRole',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicySummary: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      _variation: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoAccessTrackInfo',
      },
      billingAccount: {
        type: 'string',
      },
      blob: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoBLOB',
      },
      businessDimensions: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoBusinessDimensions',
      },
      country: {
        type: 'string',
      },
      createdFromPolicyRev: {
        format: 'int',
        type: 'integer',
      },
      createdFromQuoteRev: {
        format: 'int',
        type: 'integer',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyFleetEntityLink',
      },
      inceptionDate: {
        format: 'date-time',
        type: 'string',
      },
      methodOfDelivery: {
        type: 'string',
      },
      notes: {
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideRateEffectiveDate: {
        type: 'boolean',
      },
      packagingDetail: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPackagingDetail',
      },
      parties: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicyParty',
        },
        type: 'array',
      },
      policyDetail: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoPolicyDetail',
      },
      policyFormCd: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policySource: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      prefillInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetPrefillInfo',
      },
      premiums: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      productCd: {
        type: 'string',
      },
      rateEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      sendTo: {
        type: 'string',
      },
      sequences: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoSequences',
        },
        type: 'array',
      },
      state: {
        type: 'string',
      },
      termDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoTermDetails',
      },
      transactionDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoTransactionDetails',
      },
      vehiclesSummary: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetVehicle',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetIndividualVehicle: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      coverageGroups: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      individualVehicleLink: {
        $ref: 'GenesisAgentPolicyFleetJsonEntityRef',
      },
      offerStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetPrefillInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAddressInfo',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      gender: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      isFeetManagementSystem: {
        type: 'boolean',
      },
      isSecurityPositionAppointed: {
        type: 'boolean',
      },
      isUsingMaintenanceProgram: {
        type: 'boolean',
      },
      maintenanceFrequency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetVehicle: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      adjustedValue: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      annualMiles: {
        format: 'int',
        type: 'integer',
      },
      assignedDrivers: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoVehicleDriver',
        },
        type: 'array',
      },
      businessUseDescription: {
        type: 'string',
      },
      businessUseInd: {
        type: 'boolean',
      },
      code: {
        type: 'string',
      },
      damageDescription: {
        type: 'string',
      },
      declaredAnnualMiles: {
        format: 'int',
        type: 'integer',
      },
      distanceForPleasurePerWeek: {
        format: 'int',
        type: 'integer',
      },
      distanceOneWay: {
        format: 'int',
        type: 'integer',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      existingDamage: {
        type: 'boolean',
      },
      farmOrRanchDisc: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      garageParked: {
        type: 'boolean',
      },
      garagingAddress: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAddressInfo',
      },
      grouped: {
        type: 'boolean',
      },
      included: {
        type: 'boolean',
      },
      isGaragingAddressSameAsInsured: {
        type: 'boolean',
      },
      isKitCar: {
        type: 'boolean',
      },
      marketValue: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      marketValueOriginal: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      marketValueOverride: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      numDaysDrivenPerWeek: {
        format: 'int',
        type: 'integer',
      },
      odometerReading: {
        format: 'int',
        type: 'integer',
      },
      odometerReadingDate: {
        format: 'date',
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      plateNumber: {
        type: 'string',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      registeredAtDmv: {
        type: 'boolean',
      },
      registrationType: {
        type: 'string',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      sequences: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoSequences',
        },
        type: 'array',
      },
      series: {
        type: 'string',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicleBaseDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetVehicleEntity',
      },
      vehicleUnderwritingInfo: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_VehicleUnderwritingInfo',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_FleetVehicleEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      adjustedValue: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      adjustmentToValue: {
        type: 'number',
      },
      airBagStatusCd: {
        type: 'string',
      },
      antiLockBrakeCd: {
        type: 'string',
      },
      armoredInd: {
        type: 'boolean',
      },
      automaticBeltsInd: {
        type: 'boolean',
      },
      biSymbol: {
        type: 'string',
      },
      bodyTypeCd: {
        type: 'string',
      },
      collSymbol: {
        type: 'string',
      },
      compSymbol: {
        type: 'string',
      },
      costNew: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      daytimeRunningLampsInd: {
        type: 'boolean',
      },
      enginePower: {
        format: 'int',
        type: 'integer',
      },
      firstRegistrationYear: {
        format: 'int',
        type: 'integer',
      },
      fuelTypeCd: {
        type: 'string',
      },
      liabSymbol: {
        type: 'string',
      },
      make: {
        type: 'string',
      },
      manufactureYear: {
        format: 'int',
        type: 'integer',
      },
      marketValue: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      model: {
        type: 'string',
      },
      modelYear: {
        format: 'int',
        type: 'integer',
      },
      noVinReasonCd: {
        type: 'string',
      },
      otherUsage: {
        type: 'string',
      },
      pdSymbol: {
        type: 'string',
      },
      performanceCd: {
        type: 'string',
      },
      pipMedSymbol: {
        type: 'string',
      },
      plateNumber: {
        type: 'string',
      },
      purchasedDate: {
        format: 'date',
        type: 'string',
      },
      purchasedNew: {
        type: 'boolean',
      },
      recoveryDeviceInd: {
        type: 'boolean',
      },
      registeredOwner: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicyParty',
      },
      registeredStateCd: {
        type: 'string',
      },
      registrationRecords: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_AutoVehicleRegistrationRecord',
        },
        type: 'array',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      securityOptionsCd: {
        type: 'string',
      },
      series: {
        type: 'string',
      },
      seriesCd: {
        type: 'string',
      },
      statedAmt: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      typeCd: {
        type: 'string',
      },
      usageCd: {
        type: 'string',
      },
      usageDescription: {
        type: 'string',
      },
      usagePercent: {
        type: 'number',
      },
      vehSymbol: {
        type: 'string',
      },
      vehicleIdentificationNumber: {
        type: 'string',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_GeoCoord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_LocationBase: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_GeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_PersonBase: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_PersonalAutoInsuredMembership: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      membershipNo: {
        format: 'int',
        type: 'integer',
      },
      organizationCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_PolicyPerson: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisAgentPolicyFleetFleetAuto_LocationBase',
        },
        type: 'array',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_PersonBase',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_ReplacementCostEndorsement: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      name: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_VehicleGroup: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      assignedVehicles: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      code: {
        type: 'string',
      },
      coverageGroups: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      groupType: {
        type: 'string',
      },
      numberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyFleetMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetFleetAuto_VehicleUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetEntityKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      isAutoSalesAgency: {
        type: 'boolean',
      },
      isCompanyCar: {
        type: 'boolean',
      },
      isEmergencyServices: {
        type: 'boolean',
      },
      isOfficeUse: {
        type: 'boolean',
      },
      isParkingOperations: {
        type: 'boolean',
      },
      isPublicTransportation: {
        type: 'boolean',
      },
      isRacing: {
        type: 'boolean',
      },
      isRentalToOthers: {
        type: 'boolean',
      },
      isRepairServiceStation: {
        type: 'boolean',
      },
      isVehicleCommercialUsed: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetIdentifiableEntity: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetBaseKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetJsonEntityRef: {
    properties: {
      _ref: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetQuoteCopyRequest: {
    properties: {
      customer: {
        $ref: 'GenesisAgentPolicyFleetEntityLink',
      },
      targetAgency: {
        type: 'string',
      },
      targetAgent: {
        type: 'string',
      },
      targetBrand: {
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetQuoteInitRequest: {
    properties: {
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyFleetEntityLink',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetResolveManagerRequest: {
    properties: {
      quote: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicySummary',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetRuleOverrideAction: {
    properties: {
      categoryCd: {
        type: 'string',
      },
      duration: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityId: {
        format: 'uuid',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetRuleOverrideRequest: {
    properties: {
      entryPoint: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisAgentPolicyFleetEntityLink',
      },
      overrides: {
        items: {
          $ref: 'GenesisAgentPolicyFleetRuleOverrideAction',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetUpdateRequest: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyFleetRootEntityKey',
      },
      quote: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicySummary',
      },
      userOperations: {
        items: {
          $ref: 'GenesisAgentPolicyFleetUserOperation',
        },
        type: 'array',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyFleetUserOperation: {
    properties: {
      entity: {
        type: 'object',
      },
      path: {
        type: 'string',
      },
      userOperationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomeEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomeEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomeMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHomeDynamicPremiumDetails: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      premiumEntries: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHomePremiumEntry',
        },
        type: 'array',
      },
      premiumHolderAttributes: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHomePremiumHolderAttribute',
        },
        type: 'array',
      },
      premiumHolderCode: {
        type: 'string',
      },
      premiumHolderType: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      totals: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHomeTotalsEntry',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHomePremiumEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      addedAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      factor: {
        type: 'number',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      returnedAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      reversedAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHomePremiumHolderAttribute: {
    properties: {
      attributeData: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      attributeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHomeTotalsEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      changeAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'object',
      },
      termAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_HomeBLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      blobCd: {
        type: 'string',
      },
      lobs: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHome_HomeLOB',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_HomeLOB: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      riskItems: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeLocation',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeAdditionalInterestInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeAddressInfo',
      },
      email: {
        type: 'string',
      },
      loanAmt: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      loanNo: {
        type: 'string',
      },
      lossPayeeExpDate: {
        format: 'date',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      rank: {
        format: 'int',
        type: 'integer',
      },
      secondName: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeAddressInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      addressValidated: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      geoposition: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeGeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      sameInsuredAddressInd: {
        type: 'boolean',
      },
      stateProvCd: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
      streetAddress: {
        type: 'string',
      },
      streetName: {
        type: 'string',
      },
      streetNumber: {
        type: 'string',
      },
      unitNumber: {
        type: 'string',
      },
      zipPlus4Code: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeAtHomeCreditInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      insuredAgeQuestionInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeBrushFireInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      brushFireEligibilityInd: {
        type: 'boolean',
      },
      brushFireSurchargeInd: {
        type: 'boolean',
      },
      fuel: {
        type: 'string',
      },
      roadAccess: {
        type: 'string',
      },
      slopeOfLocation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeClaimInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      catastrophicIndicator: {
        type: 'string',
      },
      claimStatus: {
        type: 'string',
      },
      claimType: {
        type: 'string',
      },
      dateOfLoss: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      incidentSource: {
        type: 'string',
      },
      includeToRatingInd: {
        type: 'boolean',
      },
      lossAmount: {
        type: 'number',
      },
      lossDescription: {
        type: 'string',
      },
      lossType: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
      sequence: {
        format: 'int',
        type: 'integer',
      },
      totalClaimCost: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeGeoCoord: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeISO360Report: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      isoReplacementCost: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeInspectionRequest: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      agentEmail: {
        type: 'string',
      },
      agentName: {
        type: 'string',
      },
      agentPhoneNumber: {
        type: 'string',
      },
      agentPhoneNumberExt: {
        format: 'int',
        type: 'integer',
      },
      areInspectionReportsAvailable: {
        type: 'boolean',
      },
      dateOfInspection: {
        format: 'date',
        type: 'string',
      },
      dateOrdered: {
        format: 'date',
        type: 'string',
      },
      orderInspectionInd: {
        type: 'boolean',
      },
      primaryContactName: {
        type: 'string',
      },
      primaryContactPhone: {
        type: 'string',
      },
      reasonCd: {
        type: 'string',
      },
      reasonForNotOrderingInspection: {
        type: 'string',
      },
      reportTypeCd: {
        type: 'string',
      },
      secContactName: {
        type: 'string',
      },
      secContactPhone: {
        type: 'string',
      },
      specInstructions: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      uwEmail: {
        type: 'string',
      },
      uwName: {
        type: 'string',
      },
      uwPhoneNumber: {
        type: 'string',
      },
      uwPhoneNumberExt: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeLocation: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      additionalInterests: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeAdditionalInterestInfo',
        },
        type: 'array',
      },
      address: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeAddressInfo',
      },
      adjustedValue: {
        type: 'number',
      },
      adlSymbol: {
        type: 'string',
      },
      atHomeCredit: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeAtHomeCreditInfo',
      },
      bceg: {
        type: 'string',
      },
      brushFire: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeBrushFireInfo',
      },
      claims: {
        items: {
          $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeClaimInfo',
        },
        type: 'array',
      },
      cocInd: {
        type: 'boolean',
      },
      constructionDesc: {
        type: 'string',
      },
      constructionTypeCd: {
        type: 'string',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      distanceToFireHydrant: {
        format: 'int',
        type: 'integer',
      },
      distanceToFireStation: {
        format: 'int',
        type: 'integer',
      },
      distanceToShore: {
        type: 'string',
      },
      familyNum: {
        type: 'string',
      },
      fireLineScore: {
        format: 'int',
        type: 'integer',
      },
      flatOverrideAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      floor: {
        format: 'int',
        type: 'integer',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      iSO360Report: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeISO360Report',
      },
      inspectionRequest: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeInspectionRequest',
      },
      isoTerritoryCd: {
        type: 'string',
      },
      isoTerritoryEQ: {
        type: 'string',
      },
      isoTerritoryName: {
        type: 'string',
      },
      livingArea: {
        format: 'int',
        type: 'integer',
      },
      locationUse: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeLocationUse',
      },
      numOfEmpl: {
        type: 'string',
      },
      numberOfStories: {
        format: 'int',
        type: 'integer',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisAgentPolicyHomeMoney',
      },
      owned: {
        type: 'string',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      primaryResidenceInd: {
        type: 'boolean',
      },
      priorAddress: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeAddressInfo',
      },
      propagateOverride: {
        type: 'boolean',
      },
      protection: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeProtectionInfo',
      },
      protectionClassCd: {
        type: 'string',
      },
      purchaseDate: {
        format: 'date',
        type: 'string',
      },
      renovation: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeRenovationInfo',
      },
      riskRetrofittedInd: {
        type: 'boolean',
      },
      roofType: {
        type: 'string',
      },
      roofTypeDesc: {
        type: 'string',
      },
      safety: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeSafetyInfo',
      },
      slosh: {
        type: 'string',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      territoryCd: {
        type: 'string',
      },
      tier: {
        type: 'string',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      yearBuilt: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeLocationUse: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      businessConductedInd: {
        type: 'boolean',
      },
      excludeLiabilityInd: {
        type: 'boolean',
      },
      farmingConductedInd: {
        type: 'boolean',
      },
      numOfTenantsRented: {
        format: 'int',
        type: 'integer',
      },
      numOfWeeksRented: {
        format: 'int',
        type: 'integer',
      },
      occasionallyRentedToOthersInd: {
        type: 'boolean',
      },
      occupancyType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomePackagingDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      declineVariationInd: {
        type: 'boolean',
      },
      declineVariationReason: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomePolicyDetail: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      archivedAtPolicyRevision: {
        format: 'int',
        type: 'integer',
      },
      cancelNotice: {
        type: 'boolean',
      },
      cancelNoticeDate: {
        format: 'date-time',
        type: 'string',
      },
      cancelNoticeDays: {
        format: 'int',
        type: 'integer',
      },
      cancelNoticeOtherReason: {
        type: 'string',
      },
      cancelNoticeReason: {
        type: 'string',
      },
      currentQuoteInd: {
        type: 'boolean',
      },
      declineDate: {
        format: 'date-time',
        type: 'string',
      },
      declineOtherReason: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      doNotRenew: {
        type: 'boolean',
      },
      doNotRenewOtherReason: {
        type: 'string',
      },
      doNotRenewReason: {
        type: 'string',
      },
      doNotRenewStatus: {
        type: 'string',
      },
      followUpRequired: {
        type: 'boolean',
      },
      manualRenew: {
        type: 'boolean',
      },
      manualRenewOtherReason: {
        type: 'string',
      },
      manualRenewReason: {
        type: 'string',
      },
      oosProcessingStage: {
        type: 'string',
      },
      printNotice: {
        type: 'boolean',
      },
      proposeNotes: {
        type: 'string',
      },
      supportingData: {
        type: 'string',
      },
      suspendDate: {
        format: 'date-time',
        type: 'string',
      },
      suspendOtherReason: {
        type: 'string',
      },
      suspendReason: {
        type: 'string',
      },
      versionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomePolicySummary: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      _variation: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomesAccessTrackInfo',
      },
      billingAccount: {
        type: 'string',
      },
      blob: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_HomeBLOB',
      },
      businessDimensions: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomesBusinessDimensions',
      },
      conversionBookrollId: {
        type: 'string',
      },
      conversionPolicyNumber: {
        type: 'string',
      },
      conversionPolicyPremium: {
        type: 'number',
      },
      country: {
        type: 'string',
      },
      createdFromPolicyRev: {
        format: 'int',
        type: 'integer',
      },
      createdFromQuoteRev: {
        format: 'int',
        type: 'integer',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyHomeEntityLink',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      inceptionDate: {
        format: 'date-time',
        type: 'string',
      },
      methodOfDelivery: {
        type: 'string',
      },
      notes: {
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideRateEffectiveDate: {
        type: 'boolean',
      },
      packagingDetail: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomePackagingDetail',
      },
      policyDetail: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomePolicyDetail',
      },
      policyFormCd: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policySource: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      rateEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      sendTo: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termDetails: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeTermDetails',
      },
      transactionDetails: {
        $ref: 'GenesisAgentPolicyHomePersonalHome_PersonalHomeTransactionDetails',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeProtectionInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      burglarAlarmTypeCd: {
        type: 'string',
      },
      deadBoltInd: {
        type: 'boolean',
      },
      doormanOnGuardInd: {
        type: 'boolean',
      },
      extendedPerimeterProtectionInd: {
        type: 'boolean',
      },
      fireAlarmTypeCd: {
        type: 'string',
      },
      fireExtinguisherInd: {
        type: 'boolean',
      },
      guardedGatedCommunityInd: {
        type: 'boolean',
      },
      propertyGatedInd: {
        type: 'boolean',
      },
      smokeDetectorInd: {
        type: 'boolean',
      },
      sprinklerSystemTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeRenovationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      fiveYearsPropertyRenovatedInd: {
        type: 'boolean',
      },
      newElectricsInd: {
        type: 'boolean',
      },
      newPlumbingInd: {
        type: 'boolean',
      },
      newRoofInd: {
        type: 'boolean',
      },
      newWaterTankInd: {
        type: 'boolean',
      },
      renovationYear: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeSafetyInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      animalsInd: {
        type: 'boolean',
      },
      stovesInd: {
        type: 'boolean',
      },
      swimPoolInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeTermDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      termCd: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      termNo: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomeTransactionDetails: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      txCreateDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
      txType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomesAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      raw: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomePersonalHome_PersonalHomesBusinessDimensions: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyHomeEntityKey',
      },
      _type: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      organization: {
        $ref: 'GenesisAgentPolicyHomeEntityLink',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomeQuoteInitRequest: {
    properties: {
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      currencyCd: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisAgentPolicyHomeEntityLink',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyHomeRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasureEntityKey: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      parentId: {
        format: 'uuid',
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasureEntityLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasurePolicyUnderwritingMeasure_PolicyUnderwritingMeasure: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasureRootEntityKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasurePolicyUnderwritingMeasure_UMeasureAccessTrackInfo',
      },
      category: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      policy: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasureEntityLink',
      },
      reason: {
        type: 'string',
      },
      ruleConditionExpression: {
        type: 'string',
      },
      ruleContext: {
        type: 'string',
      },
      ruleEntryPoint: {
        type: 'string',
      },
      ruleExpression: {
        type: 'string',
      },
      ruleMessage: {
        type: 'string',
      },
      ruleMessageId: {
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
      ruleSeverity: {
        type: 'string',
      },
      ruleType: {
        type: 'string',
      },
      ruleUsageType: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      targetEntity: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasurePolicyUnderwritingMeasure_UMeasureAccessTrackInfo: {
    properties: {
      _key: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasureEntityKey',
      },
      _type: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasureRootEntityKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        format: 'uuid',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasureUMeasureCreateFromRuleRequest: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      policy: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasureEntityLink',
      },
      ruleEntryPoint: {
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
      rulesContext: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAgentPolicyUnderwritingMeasureUMeasureInitRequest: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      policy: {
        $ref: 'GenesisAgentPolicyUnderwritingMeasureEntityLink',
      },
      ruleContext: {
        type: 'string',
      },
      ruleEntryPoint: {
        type: 'string',
      },
      ruleExpression: {
        type: 'string',
      },
      ruleMessage: {
        type: 'string',
      },
      ruleMessageId: {
        type: 'string',
      },
      ruleType: {
        type: 'string',
      },
      targetEntity: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAlert: {
    properties: {
      alertId: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      entityId: {
        type: 'string',
      },
      entityModelName: {
        type: 'string',
      },
      entityNumber: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      userText: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisApiModelKey: {
    properties: {
      id: {
        type: 'string',
      },
      parentId: {
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisApiModelRootKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisApplicabilityOverrideInitiateRequest: {
    properties: {
      policy: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisAssignedDriver: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      assignDriverType: {
        type: 'string',
      },
      driver: {
        $ref: 'GenesisDriver',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
      percentOfUsage: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisAssociation: {
    properties: {
      entityNumber: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisAuthTokenDetails: {
    properties: {
      access_token: {
        type: 'string',
      },
      expires_in: {
        format: 'int',
        type: 'integer',
      },
      jti: {
        type: 'string',
      },
      refresh_token: {
        type: 'string',
      },
      scope: {
        type: 'string',
      },
      token_type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAuthTokenRequest: {
    properties: {
      attributes: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisAuthority: {
    properties: {
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAuthorizeToken: {
    properties: {
      error: {
        type: 'string',
      },
      expires_in: {
        format: 'int',
        type: 'integer',
      },
      token: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAutoCommunicationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'GenesisAutoEmailInfo',
        },
        type: 'array',
      },
      phones: {
        items: {
          $ref: 'GenesisAutoPhoneInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisAutoEmailInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAutoPhoneInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAutoPolicy: {},
  GenesisAutoPolicyDimensionDetails: {
    properties: {
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      rateEffectiveDate: {
        format: 'date',
        type: 'string',
      },
      revision: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAutoPolicyEvaluateDetails: {
    properties: {
      dimensions: {
        $ref: 'GenesisAutoPolicyDimensionDetails',
      },
      parameters: {
        $ref: 'GenesisPolicyContextDetails',
      },
    },
    type: 'object',
  },
  GenesisAutoPolicyOfferManagementUpdateRequest: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelRootKey',
      },
      quote: {
        $ref: 'GenesisAutoPolicy',
      },
      userOperations: {
        items: {
          $ref: 'GenesisPolicyUserOperations',
        },
        type: 'array',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisAutoQuoteDetailsWithActions: {
    properties: {
      availableCommands: {
        type: 'object',
      },
      entity: {
        $ref: 'GenesisAgentPolicyAutoPersonalAuto_PersonalAutoPolicySummary',
      },
    },
    type: 'object',
  },
  GenesisAutoVehicleDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      airBagStatusCd: {
        type: 'string',
      },
      antiLockBrakeCd: {
        type: 'string',
      },
      armoredInd: {
        type: 'boolean',
      },
      automaticBeltsInd: {
        type: 'boolean',
      },
      bodyTypeCd: {
        type: 'string',
      },
      collSymbol: {
        type: 'string',
      },
      compSymbol: {
        type: 'string',
      },
      daytimeRunningLampsInd: {
        type: 'boolean',
      },
      enginePower: {
        format: 'int',
        type: 'integer',
      },
      firstRegistrationYear: {
        format: 'int',
        type: 'integer',
      },
      fuelTypeCd: {
        type: 'string',
      },
      make: {
        type: 'string',
      },
      manufactureYear: {
        format: 'int',
        type: 'integer',
      },
      model: {
        type: 'string',
      },
      modelYear: {
        format: 'int',
        type: 'integer',
      },
      noVinReasonCd: {
        type: 'string',
      },
      performanceCd: {
        type: 'string',
      },
      purchasedDate: {
        format: 'date',
        type: 'string',
      },
      purchasedNew: {
        type: 'boolean',
      },
      recoveryDeviceInd: {
        type: 'boolean',
      },
      registrationRecords: {
        items: {
          $ref: 'GenesisRegistrationRecords',
        },
        type: 'array',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      securityOptionsCd: {
        type: 'string',
      },
      seriesCd: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
      usageCd: {
        type: 'string',
      },
      vehSymbol: {
        type: 'string',
      },
      vehicleIdentificationNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisBlobInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      blobCd: {
        type: 'string',
      },
      lobs: {
        items: {
          $ref: 'GenesisLobInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisCampaign: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      actualCost: {
        type: 'number',
      },
      autoStart: {
        type: 'boolean',
      },
      budgetCost: {
        type: 'number',
      },
      campaignId: {
        type: 'string',
      },
      categoryCd: {
        type: 'string',
      },
      channels: {
        items: {
          $ref: 'GenesisCampaignChannelInfo',
        },
        type: 'array',
      },
      customerType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      divertCampaignNotification: {
        type: 'boolean',
      },
      divertTo: {
        type: 'string',
      },
      duration: {
        format: 'int',
        type: 'integer',
      },
      endDate: {
        format: 'date',
        type: 'string',
      },
      expectedRevenue: {
        type: 'number',
      },
      name: {
        type: 'string',
      },
      owner: {
        $ref: 'GenesisLink',
      },
      parent: {
        $ref: 'GenesisLink',
      },
      products: {
        items: {
          $ref: 'GenesisCampaignProductInfo',
        },
        type: 'array',
      },
      promotionCd: {
        type: 'string',
      },
      startDate: {
        format: 'date',
        type: 'string',
      },
      state: {
        type: 'string',
      },
      suspendFrom: {
        format: 'date',
        type: 'string',
      },
      suspendTo: {
        format: 'date',
        type: 'string',
      },
      targetCharacteristics: {
        items: {
          $ref: 'GenesisCommonTargetCharacteristic',
        },
        type: 'array',
      },
      targetRelationshipRoles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      terminationExplain: {
        type: 'string',
      },
      terminationReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCampaignChannelInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      campaignChannelCd: {
        type: 'string',
      },
      campaignMaterialCd: {
        type: 'string',
      },
      campaignSubChannelCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCampaignProductInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      lineOfBusiness: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      riskItem: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCensus: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      name: {
        type: 'string',
      },
      orgCustomer: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisCensusClass: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      description: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      orgCustomer: {
        $ref: 'GenesisLink',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCensusItem: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      ratingInfo: {
        $ref: 'GenesisCensusItemsRatingInfo',
      },
    },
    type: 'object',
  },
  GenesisCensusItemCreateRequest: {
    properties: {
      censusItem: {
        $ref: 'GenesisCensusItem',
      },
      censusKey: {
        $ref: 'GenesisApiModelRootKey',
      },
    },
    type: 'object',
  },
  GenesisCensusItemsRatingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      censusDate: {
        format: 'date',
        type: 'string',
      },
      employeeInfo: {
        $ref: 'GenesisCensusItemsRatingInfoEmployeeInfo',
      },
      insuranceLTD: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceLTDBuyUp: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceNJTDB: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceNYDBL: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceNYPFL: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceSTD: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      insuranceSTDBuyUp: {
        $ref: 'GenesisCensusItemsRatingInfoInsurance',
      },
      lobCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCensusItemsRatingInfoEmployeeInfo: {
    properties: {
      _type: {
        type: 'string',
      },
      age: {
        format: 'int',
        type: 'integer',
      },
      dateOfDisability: {
        format: 'date',
        type: 'string',
      },
      dateOfHire: {
        format: 'date',
        type: 'string',
      },
      disabilityEarnings: {
        type: 'number',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      earningsMode: {
        type: 'string',
      },
      fullTime: {
        type: 'boolean',
      },
      gender: {
        type: 'string',
      },
      idNumber: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      residentialZipCode: {
        type: 'string',
      },
      smokerIndicator: {
        type: 'boolean',
      },
      stateOfResidence: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      union: {
        type: 'boolean',
      },
      workLocationState: {
        type: 'string',
      },
      workLocationZipCode: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCensusItemsRatingInfoInsurance: {
    properties: {
      elected: {
        type: 'boolean',
      },
      eligible: {
        type: 'boolean',
      },
      plan: {
        type: 'string',
      },
      ratingClass: {
        format: 'int',
        type: 'integer',
      },
      ratingClassName: {
        type: 'string',
      },
      volume: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisClaimInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      claimAssociation: {
        type: 'string',
      },
      claimNumber: {
        type: 'string',
      },
      claimStatus: {
        type: 'string',
      },
      claimType: {
        type: 'string',
      },
      dateOfLoss: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      lossType: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      totalClaimCost: {
        $ref: 'GenesisMoney',
      },
    },
    type: 'object',
  },
  GenesisClientProperty: {
    properties: {
      propertyName: {
        type: 'string',
      },
      propertyValue: {
        type: 'object',
      },
      userId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCommonCustomer: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      assignmentRelationships: {
        items: {
          $ref: 'GenesisCustomerRelationship',
        },
        type: 'array',
      },
      billingInfos: {
        items: {
          $ref: 'GenesisCustomerBillingInfo',
        },
        type: 'array',
      },
      claimInfos: {
        items: {
          $ref: 'GenesisCustomerClaimInfo',
        },
        type: 'array',
      },
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      customerGroupInfos: {
        items: {
          $ref: 'GenesisCustomerGroupInfo',
        },
        type: 'array',
      },
      customerNumber: {
        type: 'string',
      },
      majorAccount: {
        $ref: 'GenesisLink',
      },
      majorAccountId: {
        type: 'string',
      },
      majorAccountName: {
        type: 'string',
      },
      preferredCurrency: {
        type: 'string',
      },
      prevRevNo: {
        format: 'int',
        type: 'integer',
      },
      productsOwned: {
        items: {
          $ref: 'GenesisCustomerProductOwned',
        },
        type: 'array',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      state: {
        type: 'string',
      },
      taxExempt: {
        type: 'boolean',
      },
      taxExemptComment: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCommonPolicy: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _sagaId: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      _variation: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      blob: {
        $ref: 'GenesisBlobInfo',
      },
      createdFromQuoteRev: {
        format: 'int',
        type: 'integer',
      },
      policyNumber: {
        type: 'string',
      },
      premiums: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        readOnly: true,
        type: 'array',
      },
      productCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      termDetails: {
        $ref: 'GenesisPolicyTerm',
      },
      transactionDetails: {
        $ref: 'GenesisTransactionDetails',
      },
    },
    type: 'object',
  },
  GenesisCommonTargetCharacteristic: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCommunication: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      agency: {
        type: 'string',
      },
      associations: {
        items: {
          $ref: 'GenesisAssociation',
        },
        type: 'array',
      },
      categoryCd: {
        type: 'string',
      },
      channel: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      direction: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performer: {
        type: 'string',
      },
      products: {
        items: {
          $ref: 'GenesisCommunicationProductInfo',
        },
        type: 'array',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      thread: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
      threadId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCommunicationCreateRequest: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      agency: {
        type: 'string',
      },
      associations: {
        items: {
          $ref: 'GenesisAssociation',
        },
        type: 'array',
      },
      categoryCd: {
        type: 'string',
      },
      channel: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      direction: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performer: {
        type: 'string',
      },
      products: {
        items: {
          $ref: 'GenesisCommunicationProductInfo',
        },
        type: 'array',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      thread: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
      threadId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCommunicationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'GenesisEmailInfo',
        },
        type: 'array',
      },
      phones: {
        items: {
          $ref: 'GenesisPhoneInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisCommunicationProductInfo: {
    properties: {
      id: {
        type: 'string',
      },
      lineOfBusiness: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisComparisonCompareJsonRequest: {
    properties: {
      sourcePayload: {
        type: 'object',
      },
      targetPayload: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisComparisonCompareJsonResponse: {
    properties: {
      conflictingDiffs: {
        items: {
          $ref: 'GenesisComparisonConflictingDetails',
        },
        type: 'array',
      },
      diffs: {
        items: {
          $ref: 'GenesisComparisonDiffDetails',
        },
        type: 'array',
      },
      targetPayload: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisComparisonConflictingDetails: {
    properties: {
      currentDiff: {
        $ref: 'GenesisComparisonDiffDetails',
      },
      futureDiff: {
        $ref: 'GenesisComparisonDiffDetails',
      },
    },
    type: 'object',
  },
  GenesisComparisonDiffDetails: {
    properties: {
      operationType: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      readOnly: {
        type: 'boolean',
      },
      sourceValue: {
        type: 'object',
      },
      targetValue: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisConsentInfo: {
    properties: {
      consentDate: {
        format: 'date',
        type: 'string',
      },
      consentStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCreditScoreInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      isCompanyAlert: {
        type: 'boolean',
      },
      ofacClearance: {
        type: 'boolean',
      },
      score: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCrmDivision: {
    properties: {
      billingMethod: {
        type: 'string',
      },
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      divisionName: {
        type: 'string',
      },
      divisionNumber: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      numberOfInsureds: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisCustomerAccount: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      accountGroupInfos: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
      accountNumber: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      confidentialInd: {
        type: 'boolean',
      },
      customers: {
        items: {
          $ref: 'GenesisCustomerAssociation',
        },
        type: 'array',
      },
      designatedContacts: {
        items: {
          $ref: 'GenesisDesignatedContact',
        },
        type: 'array',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      specialHandling: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerAccountCreateUpdateRequest: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      accountGroupInfos: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
      agency: {
        type: 'string',
      },
      confidentialInd: {
        type: 'boolean',
      },
      customers: {
        items: {
          $ref: 'GenesisCustomerAssociation',
        },
        type: 'array',
      },
      designatedContacts: {
        items: {
          $ref: 'GenesisDesignatedContact',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      specialHandling: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerAdditionalName: {
    properties: {
      description: {
        type: 'string',
      },
      designation: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerAddress: {
    properties: {
      addressValidatedInd: {
        type: 'boolean',
      },
      attention: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      county: {
        type: 'string',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      inCareOf: {
        type: 'string',
      },
      location: {
        $ref: 'GenesisLocation',
      },
      preferred: {
        type: 'boolean',
      },
      referenceId: {
        type: 'string',
      },
      schedulingContactInfo: {
        $ref: 'GenesisSchedulingContactInfo',
      },
      subdivision: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerAssociation: {
    properties: {
      customerNumber: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisCustomerBillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      billingAccount: {
        type: 'string',
      },
      currentDueAmount: {
        type: 'number',
      },
      currentDueDate: {
        format: 'date-time',
        type: 'string',
      },
      link: {
        type: 'string',
      },
      policy: {
        type: 'string',
      },
      totalPaid: {
        type: 'number',
      },
      unpaidBalance: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisCustomerBusinessDetails: {
    properties: {
      businessName: {
        type: 'string',
      },
      businessType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      legalEntity: {
        $ref: 'GenesisLegalEntity',
      },
      naicsCode: {
        type: 'string',
      },
      naicsDescription: {
        type: 'string',
      },
      naicsIndustryGroup: {
        type: 'string',
      },
      naicsSector: {
        type: 'string',
      },
      naicsSubSector: {
        type: 'string',
      },
      numberOfContinuous: {
        format: 'int',
        type: 'integer',
      },
      sicCode: {
        type: 'string',
      },
      sicDescription: {
        type: 'string',
      },
      sicDivision: {
        type: 'string',
      },
      sicIndustry: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerBusinessEntity: {
    properties: {
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      details: {
        $ref: 'GenesisCustomerBusinessDetails',
      },
      id: {
        type: 'string',
      },
      taxExempt: {
        type: 'string',
      },
      taxExemptComment: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerChat: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerClaimInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      claimFileOwner: {
        type: 'string',
      },
      claimFileOwnerPhone: {
        type: 'string',
      },
      claimId: {
        type: 'string',
      },
      claimants: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      dateOfLoss: {
        format: 'date-time',
        type: 'string',
      },
      incurred: {
        type: 'number',
      },
      link: {
        type: 'string',
      },
      policy: {
        type: 'string',
      },
      policyProduct: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerCommunicationInfo: {
    properties: {
      addresses: {
        items: {
          $ref: 'GenesisCustomerAddress',
        },
        type: 'array',
      },
      chats: {
        items: {
          $ref: 'GenesisCustomerChat',
        },
        type: 'array',
      },
      emails: {
        items: {
          $ref: 'GenesisCustomerEmail',
        },
        type: 'array',
      },
      phones: {
        items: {
          $ref: 'GenesisCustomerPhone',
        },
        type: 'array',
      },
      preferredContactMethod: {
        type: 'string',
      },
      socialNets: {
        items: {
          $ref: 'GenesisCustomerSocialNet',
        },
        type: 'array',
      },
      webAddresses: {
        items: {
          $ref: 'GenesisCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisCustomerEmail: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentInfo: {
        $ref: 'GenesisConsentInfo',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      email: {
        type: 'string',
      },
      emailType: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerEmploymentDetails: {
    properties: {
      asOfDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      employerName: {
        type: 'string',
      },
      jobTitleCd: {
        type: 'string',
      },
      jobTitleDescription: {
        type: 'string',
      },
      occupationCd: {
        type: 'string',
      },
      occupationStatusCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerGeoCoord: {
    properties: {
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisCustomerGroupInfo: {
    properties: {
      comment: {
        type: 'string',
      },
      groupInfo: {
        $ref: 'GenesisLink',
      },
      membershipDate: {
        format: 'date',
        type: 'string',
      },
      membershipLevel: {
        type: 'string',
      },
      membershipNumber: {
        type: 'string',
      },
      membershipStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerIndividualDetails: {
    properties: {
      citizenship: {
        type: 'string',
      },
      deathNotificationReceived: {
        type: 'boolean',
      },
      designation: {
        type: 'string',
      },
      designationDescription: {
        type: 'string',
      },
      disabilities: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      nickname: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      paperless: {
        type: 'boolean',
      },
      person: {
        $ref: 'GenesisCustomerPerson',
      },
      preferredSpokenLanguage: {
        type: 'string',
      },
      preferredWrittenLanguage: {
        type: 'string',
      },
      registerOnline: {
        type: 'boolean',
      },
      suffix: {
        type: 'string',
      },
      tobaccoCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerPerson: {
    properties: {
      _confidential: {
        type: 'string',
      },
      birthDate: {
        format: 'date-time',
        type: 'string',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date-time',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerPhone: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentInfo: {
        $ref: 'GenesisConsentInfo',
      },
      consentToTextDate: {
        format: 'date',
        type: 'string',
      },
      consentToTextStatus: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      preferredDaysToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      preferredTimesToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      schedulingContactInfo: {
        $ref: 'GenesisSchedulingContactInfo',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerProductOwned: {
    properties: {
      carrierNameCd: {
        type: 'string',
      },
      carrierNameDescription: {
        type: 'string',
      },
      link: {
        type: 'string',
      },
      policyExpirationDate: {
        format: 'date',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyTypeCd: {
        type: 'string',
      },
      productOwnedId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerRelationship: {
    properties: {
      answer: {
        type: 'string',
      },
      authorisationOption: {
        type: 'string',
      },
      challengeQuestion: {
        type: 'string',
      },
      designatedComment: {
        type: 'string',
      },
      passwordPassphrase: {
        type: 'string',
      },
      passwordReminder: {
        type: 'string',
      },
      relatedCustomer: {
        $ref: 'GenesisLink',
      },
      relationshipDescription: {
        type: 'string',
      },
      relationshipType: {
        type: 'string',
      },
      serviceRole: {
        type: 'boolean',
      },
      serviceRoleCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisCustomerScheduledUpdateRequest: {
    properties: {
      customerKey: {
        type: 'string',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerSocialNet: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisCustomerWebAddress: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      preferred: {
        type: 'boolean',
      },
      type: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisDesignatedContact: {
    properties: {
      agent: {
        $ref: 'GenesisLink',
      },
      contactPhone: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisDimension: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      dimensionCd: {
        type: 'string',
      },
      dimensionValues: {
        items: {
          $ref: 'GenesisDimensionValue',
        },
        type: 'array',
      },
      unrestricted: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisDimensionProfile: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      assignedScope: {
        $ref: 'GenesisDimensionScope',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisDimensionScope: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      dimensions: {
        items: {
          $ref: 'GenesisDimension',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisDimensionValue: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      dimensionValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisDriver: {
    properties: {
      _ref: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisDriverInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisClaimInfo',
        },
        type: 'array',
      },
      companyEmployee: {
        type: 'boolean',
      },
      companyEmployeeNumber: {
        type: 'string',
      },
      continuouslyWithCompany: {
        format: 'date',
        type: 'string',
      },
      convictedOfFelonyInd: {
        type: 'boolean',
      },
      driverType: {
        type: 'string',
      },
      fillingInfo: {
        $ref: 'GenesisFillingInfo',
      },
      included: {
        type: 'boolean',
      },
      licenseInfo: {
        items: {
          $ref: 'GenesisLicenseInfo',
        },
        type: 'array',
      },
      prefilled: {
        type: 'boolean',
      },
      reasonForExclusion: {
        type: 'string',
      },
      reportsOrdered: {
        type: 'boolean',
      },
      studentInfo: {
        $ref: 'GenesisStudentInfo',
      },
      suspensions: {
        items: {
          $ref: 'GenesisSuspensionInfo',
        },
        type: 'array',
      },
      trainingCompletionDate: {
        format: 'date',
        type: 'string',
      },
      underwritingInfo: {
        $ref: 'GenesisUnderwritingInfo',
      },
      violations: {
        items: {
          $ref: 'GenesisViolationInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisEmailInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisEmploymentCustomerAssociation: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisEmploymentDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisEmploymentCustomerAssociation',
      },
      departmentId: {
        type: 'string',
      },
      divisionId: {
        type: 'string',
      },
      employeeId: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      employmentType: {
        type: 'string',
      },
      expatriate: {
        type: 'boolean',
      },
      hourlyWage: {
        type: 'string',
      },
      jobCode: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      locationId: {
        type: 'string',
      },
      originalHireDate: {
        format: 'date',
        type: 'string',
      },
      payClass: {
        type: 'string',
      },
      payType: {
        type: 'string',
      },
      payrollFrequency: {
        type: 'string',
      },
      rehireDate: {
        format: 'date',
        type: 'string',
      },
      salaryAmount: {
        type: 'string',
      },
      unionMember: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeAccessTrackInfo: {
    properties: {
      createdBy: {
        type: 'string',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      raw: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgencyContainer: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisFacadeAccessTrackInfo',
      },
      addresses: {
        items: {
          $ref: 'GenesisFacadeCustomerAddress',
        },
        type: 'array',
      },
      agencyCode: {
        type: 'string',
      },
      billingsInfo: {
        items: {
          $ref: 'GenesisFacadeCustomerBillingInfo',
        },
        type: 'array',
      },
      claimsInfo: {
        items: {
          $ref: 'GenesisFacadeCustomerClaimInfo',
        },
        type: 'array',
      },
      paperless: {
        type: 'boolean',
      },
      preferredSpokenLanguage: {
        type: 'string',
      },
      preferredWrittenLanguage: {
        type: 'string',
      },
      productsOwned: {
        items: {
          $ref: 'GenesisFacadeCustomerProductOwned',
        },
        type: 'array',
      },
      relationships: {
        $ref: 'GenesisFacadeCustomerRelationshipGroups',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentCustomerEmploymentInfo: {
    properties: {
      addresses: {
        items: {
          $ref: 'GenesisFacadeCustomerAddress',
        },
        type: 'array',
      },
      asOfDate: {
        format: 'date',
        type: 'string',
      },
      chats: {
        items: {
          $ref: 'GenesisFacadeCustomerChat',
        },
        type: 'array',
      },
      emails: {
        items: {
          $ref: 'GenesisFacadeCustomerEmail',
        },
        type: 'array',
      },
      employerName: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      jobTitleCd: {
        type: 'string',
      },
      jobTitleDescription: {
        type: 'string',
      },
      occupationCd: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      occupationStatusCd: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'GenesisFacadeCustomerPhone',
        },
        type: 'array',
      },
      socialNets: {
        items: {
          $ref: 'GenesisFacadeCustomerSocialNet',
        },
        type: 'array',
      },
      webAddresses: {
        items: {
          $ref: 'GenesisFacadeCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentOpportunity: {
    properties: {
      campaignId: {
        type: 'string',
      },
      closeReason: {
        type: 'string',
      },
      closeReasonDescription: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dateCreated: {
        format: 'date-time',
        type: 'string',
      },
      dateModified: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      opportunityChannelCd: {
        type: 'string',
      },
      opportunityId: {
        type: 'string',
      },
      opportunityLikelihoodCd: {
        type: 'string',
      },
      potential: {
        $ref: 'AgentMoney',
      },
      productsInfo: {
        items: {
          $ref: 'AgentOpportunityProductInfo',
        },
        type: 'array',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentOpportunityAssociation: {
    properties: {
      actualPremium: {
        type: 'number',
      },
      associationNumber: {
        type: 'string',
      },
      associationType: {
        type: 'string',
      },
      associationVariation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentOpportunityDetails: {
    properties: {
      campaignId: {
        type: 'string',
      },
      closeReason: {
        type: 'string',
      },
      closeReasonDescription: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      dateCreated: {
        format: 'date-time',
        type: 'string',
      },
      dateModified: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      opportunityAssociations: {
        items: {
          $ref: 'GenesisFacadeAgentOpportunityAssociation',
        },
        type: 'array',
      },
      opportunityChannelCd: {
        type: 'string',
      },
      opportunityId: {
        type: 'string',
      },
      opportunityLikelihoodCd: {
        type: 'string',
      },
      owner: {
        $ref: 'GenesisFacadeAgentOpportunityOwner',
      },
      potential: {
        $ref: 'AgentMoney',
      },
      productsInfo: {
        items: {
          $ref: 'AgentOpportunityProductInfo',
        },
        type: 'array',
      },
      referral: {
        $ref: 'GenesisFacadeAgentOpportunityReferral',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentOpportunityOwner: {
    properties: {
      id: {
        type: 'string',
      },
      queueName: {
        type: 'string',
      },
      type: {
        enum: ['INTERNAL', 'QUEUE'],
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeAgentOpportunityReferral: {
    properties: {
      displayValue: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCampaign: {
    properties: {
      actualCost: {
        type: 'number',
      },
      autoStart: {
        type: 'boolean',
      },
      budgetCost: {
        type: 'number',
      },
      campaignID: {
        type: 'string',
      },
      categoryCd: {
        type: 'string',
      },
      channels: {
        items: {
          $ref: 'CampaignChannel',
        },
        type: 'array',
      },
      createdBy: {
        type: 'string',
      },
      dateCreated: {
        format: 'date-time',
        type: 'string',
      },
      dateModified: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      endDate: {
        format: 'date',
        type: 'string',
      },
      expectedRevenue: {
        type: 'number',
      },
      modifiedBy: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      owner: {
        $ref: 'GenesisFacadeCampaignOwner',
      },
      products: {
        items: {
          $ref: 'CampaignProduct',
        },
        type: 'array',
      },
      promotionCd: {
        type: 'string',
      },
      startDate: {
        format: 'date',
        type: 'string',
      },
      status: {
        enum: ['DRAFT', 'INACTIVE', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'COMPLETED', 'ARCHIVED'],
        type: 'string',
      },
      suspendFrom: {
        format: 'date',
        type: 'string',
      },
      suspendTo: {
        format: 'date',
        type: 'string',
      },
      targetCharacteristics: {
        $ref: 'AgentCampaignCharacteristics',
      },
      terminationReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCampaignOwner: {
    properties: {
      id: {
        type: 'string',
      },
      queueName: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
      version: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFacadeCommunicationActivityDetails: {
    properties: {
      agency: {
        type: 'string',
      },
      attachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      communicationTypeCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastUpdatedDate: {
        format: 'date-time',
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performerDescription: {
        type: 'string',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      thread: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      threadId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCommunicationActivitySummary: {
    properties: {
      agency: {
        type: 'string',
      },
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      communicationTypeCd: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastUpdatedDate: {
        format: 'date-time',
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performerDescription: {
        type: 'string',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      subject: {
        type: 'string',
      },
      thread: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      threadId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCommunicationActivityUpdate: {
    properties: {
      agency: {
        type: 'string',
      },
      categoryCd: {
        type: 'string',
      },
      channelCd: {
        type: 'string',
      },
      communicationId: {
        type: 'string',
      },
      communicationTypeCd: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      directionCd: {
        type: 'string',
      },
      entityReferenceId: {
        type: 'string',
      },
      entityTypeCd: {
        type: 'string',
      },
      internalCallerCd: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      outcome: {
        type: 'string',
      },
      performerDescription: {
        type: 'string',
      },
      referenceDescription: {
        type: 'string',
      },
      sourceCd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      subCategoryCd: {
        type: 'string',
      },
      thread: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      threadId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerAccount: {
    properties: {
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerAccountDetails: {
    properties: {
      accountGroupInfos: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      accountNumber: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      confidentialInd: {
        type: 'boolean',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      customers: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      designatedContacts: {
        items: {
          $ref: 'GenesisFacadeDesignatedContact',
        },
        type: 'array',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      specialHandling: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerAccountDetailsCreateUpdateRequest: {
    properties: {
      accountGroupInfos: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      agency: {
        type: 'string',
      },
      confidentialInd: {
        type: 'boolean',
      },
      createdOn: {
        format: 'date-time',
        type: 'string',
      },
      customers: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      designatedContacts: {
        items: {
          $ref: 'GenesisFacadeDesignatedContact',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      specialHandling: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerAddress: {
    properties: {
      accuracy: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      attention: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      duration: {
        format: 'int',
        type: 'integer',
      },
      effectiveFrom: {
        format: 'date',
        type: 'string',
      },
      effectiveTo: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      inCareOf: {
        type: 'string',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
      postalCode: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
      referenceId: {
        type: 'string',
      },
      stateProvCd: {
        type: 'string',
      },
      subdivision: {
        type: 'string',
      },
      temporary: {
        type: 'boolean',
      },
      validationIndicator: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerBillingInfo: {
    properties: {
      billingAccount: {
        type: 'string',
      },
      currentDueAmount: {
        type: 'number',
      },
      currentDueDate: {
        format: 'date-time',
        type: 'string',
      },
      link: {
        type: 'string',
      },
      policy: {
        type: 'string',
      },
      totalPaid: {
        type: 'number',
      },
      unpaidBalance: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerBusinessDetails: {
    properties: {
      businessType: {
        type: 'string',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      entityType: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      groupSponsorInd: {
        type: 'boolean',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      naicsCode: {
        type: 'string',
      },
      numberOfContinuous: {
        format: 'int',
        type: 'integer',
      },
      numberOfEmployees: {
        format: 'int',
        type: 'integer',
      },
      referenceCategories: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      referenceComment: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      sicCode: {
        type: 'string',
      },
      taxExemptInd: {
        type: 'boolean',
      },
      taxIdentificationId: {
        type: 'string',
      },
      useAsReference: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerBusinessEntity: {
    properties: {
      addresses: {
        items: {
          $ref: 'GenesisFacadeCustomerAddress',
        },
        type: 'array',
      },
      businessType: {
        type: 'string',
      },
      chats: {
        items: {
          $ref: 'GenesisFacadeCustomerChat',
        },
        type: 'array',
      },
      comment: {
        type: 'string',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      emails: {
        items: {
          $ref: 'GenesisFacadeCustomerEmail',
        },
        type: 'array',
      },
      id: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      naicsCode: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'GenesisFacadeCustomerPhone',
        },
        type: 'array',
      },
      sicCode: {
        type: 'string',
      },
      socialNets: {
        items: {
          $ref: 'GenesisFacadeCustomerSocialNet',
        },
        type: 'array',
      },
      taxExemptInd: {
        type: 'boolean',
      },
      webAddresses: {
        items: {
          $ref: 'GenesisFacadeCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerChat: {
    properties: {
      chatId: {
        type: 'string',
      },
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerClaimInfo: {
    properties: {
      claimFileOwner: {
        type: 'string',
      },
      claimFileOwnerPhone: {
        type: 'string',
      },
      claimId: {
        type: 'string',
      },
      claimants: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      dateOfLoss: {
        format: 'date-time',
        type: 'string',
      },
      incurred: {
        type: 'number',
      },
      link: {
        type: 'string',
      },
      policy: {
        type: 'string',
      },
      policyProduct: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerCommunicationInfo: {
    properties: {
      addresses: {
        items: {
          $ref: 'GenesisFacadeCustomerAddress',
        },
        type: 'array',
      },
      chats: {
        items: {
          $ref: 'GenesisFacadeCustomerChat',
        },
        type: 'array',
      },
      emails: {
        items: {
          $ref: 'GenesisFacadeCustomerEmail',
        },
        type: 'array',
      },
      id: {
        type: 'string',
      },
      phones: {
        items: {
          $ref: 'GenesisFacadeCustomerPhone',
        },
        type: 'array',
      },
      preferredContactMethod: {
        type: 'string',
      },
      socialNets: {
        items: {
          $ref: 'GenesisFacadeCustomerSocialNet',
        },
        type: 'array',
      },
      webAddresses: {
        items: {
          $ref: 'GenesisFacadeCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerDetails: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      accounts: {
        items: {
          $ref: 'GenesisFacadeCustomerAccount',
        },
        type: 'array',
      },
      addresses: {
        items: {
          $ref: 'GenesisFacadeCustomerAddress',
        },
        type: 'array',
      },
      agencies: {
        items: {
          $ref: 'GenesisFacadeAgencyContainer',
        },
        type: 'array',
      },
      archived: {
        type: 'boolean',
      },
      billingInfos: {
        items: {
          $ref: 'GenesisFacadeCustomerBillingInfo',
        },
        type: 'array',
      },
      brandCd: {
        type: 'string',
      },
      businessCustomerAdditionalNames: {
        items: {
          $ref: 'AgentBusinessCustomerAdditionalName',
        },
        type: 'array',
      },
      businessDetails: {
        $ref: 'GenesisFacadeCustomerBusinessDetails',
      },
      businessEntities: {
        items: {
          $ref: 'GenesisFacadeCustomerBusinessEntity',
        },
        type: 'array',
      },
      chats: {
        items: {
          $ref: 'GenesisFacadeCustomerChat',
        },
        type: 'array',
      },
      claimInfos: {
        items: {
          $ref: 'GenesisFacadeCustomerClaimInfo',
        },
        type: 'array',
      },
      communications: {
        items: {
          $ref: 'CommunicationActivitySummary',
        },
        type: 'array',
      },
      createdDate: {
        format: 'date-time',
        type: 'string',
      },
      customerEmployments: {
        items: {
          $ref: 'GenesisFacadeAgentCustomerEmploymentInfo',
        },
        type: 'array',
      },
      customerGroupInfos: {
        items: {
          $ref: 'GenesisFacadeCustomerGroupInfo',
        },
        type: 'array',
      },
      customerNumber: {
        type: 'string',
      },
      customerStatus: {
        type: 'string',
      },
      customerType: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      divisions: {
        items: {
          $ref: 'GenesisFacadeCustomerDivision',
        },
        type: 'array',
      },
      emails: {
        items: {
          $ref: 'GenesisFacadeCustomerEmail',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      genericRelationships: {
        $ref: 'GenesisFacadeCustomerRelationshipGroups',
      },
      id: {
        type: 'string',
      },
      indCustomerAdditionalNames: {
        items: {
          $ref: 'AgentIndividualCustomerAdditionalName',
        },
        type: 'array',
      },
      individualDetails: {
        $ref: 'GenesisFacadeCustomerIndividualDetails',
      },
      leadOwner: {
        type: 'string',
      },
      mergedFrom: {
        items: {
          $ref: 'GenesisFacadeCustomerReference',
        },
        readOnly: true,
        type: 'array',
      },
      mergedTo: {
        $ref: 'GenesisFacadeCustomerReference',
        readOnly: true,
      },
      navigationLinks: {
        items: {
          $ref: 'AgentCustomerNavigationLink',
        },
        type: 'array',
      },
      paperless: {
        type: 'boolean',
      },
      participationInfo: {
        $ref: 'GenesisFacadeCustomerParticipationInfo',
      },
      phones: {
        items: {
          $ref: 'GenesisFacadeCustomerPhone',
        },
        type: 'array',
      },
      preferredContactMethod: {
        type: 'string',
      },
      preferredCurrency: {
        type: 'string',
      },
      preferredSpokenLanguageCd: {
        type: 'string',
      },
      preferredWrittenLanguageCd: {
        type: 'string',
      },
      productsOwned: {
        items: {
          $ref: 'GenesisFacadeCustomerProductOwned',
        },
        type: 'array',
      },
      providers: {
        items: {
          $ref: 'AgentCustomerServiceProvider',
        },
        type: 'array',
      },
      rateDateIntake: {
        type: 'string',
      },
      rateDatePayment: {
        type: 'string',
      },
      ratingCd: {
        type: 'string',
      },
      registeredOnline: {
        type: 'boolean',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      socialNets: {
        items: {
          $ref: 'GenesisFacadeCustomerSocialNet',
        },
        type: 'array',
      },
      sourceCd: {
        type: 'string',
      },
      sourceDescription: {
        type: 'string',
      },
      sourceOfExchangeRate: {
        type: 'string',
      },
      taxExemptComment: {
        type: 'string',
      },
      taxExemptInd: {
        type: 'boolean',
      },
      webAddresses: {
        items: {
          $ref: 'GenesisFacadeCustomerWebAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerDetailsVersion: {
    properties: {
      customerDetails: {
        $ref: 'GenesisFacadeCustomerDetails',
      },
      updatedBy: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      version: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerDivision: {
    properties: {
      billingMethod: {
        type: 'string',
      },
      communicationInfo: {
        $ref: 'GenesisFacadeCustomerCommunicationInfo',
      },
      divisionName: {
        type: 'string',
      },
      divisionNumber: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      id: {
        type: 'string',
      },
      numberOfInsureds: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerEmail: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentDate: {
        format: 'date',
        type: 'string',
      },
      consentStatus: {
        type: 'string',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      emailId: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerEmploymentDetails: {
    properties: {
      customerNumber: {
        type: 'string',
      },
      departmentId: {
        type: 'string',
      },
      divisionId: {
        type: 'string',
      },
      employeeId: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      employmentType: {
        type: 'string',
      },
      expatriate: {
        type: 'boolean',
      },
      hourlyWage: {
        type: 'string',
      },
      jobCode: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      locationId: {
        type: 'string',
      },
      originalHireDate: {
        format: 'date',
        type: 'string',
      },
      payClass: {
        type: 'string',
      },
      payType: {
        type: 'string',
      },
      payrollFrequency: {
        type: 'string',
      },
      rehireDate: {
        format: 'date',
        type: 'string',
      },
      salaryAmount: {
        type: 'string',
      },
      unionMember: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerGroupInfo: {
    properties: {
      comment: {
        type: 'string',
      },
      groupId: {
        readOnly: true,
        type: 'string',
      },
      groupInfo: {
        type: 'string',
      },
      membershipDate: {
        format: 'date',
        type: 'string',
      },
      membershipId: {
        type: 'string',
      },
      membershipLevel: {
        type: 'string',
      },
      membershipNumber: {
        type: 'string',
      },
      membershipStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerIndividualDetails: {
    properties: {
      associateBusinessEntity: {
        type: 'boolean',
      },
      associateEmployments: {
        type: 'boolean',
      },
      associateProviders: {
        type: 'boolean',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      citizenshipCd: {
        type: 'string',
      },
      deathDate: {
        format: 'date',
        type: 'string',
      },
      deathNotificationReceived: {
        type: 'boolean',
      },
      deceased: {
        type: 'boolean',
      },
      designationCd: {
        type: 'string',
      },
      designationDescription: {
        type: 'string',
      },
      disabilities: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      interests: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      lastName: {
        type: 'string',
      },
      maritalStatusCd: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      nickname: {
        type: 'string',
      },
      occupationCd: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      tobaccoCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerMembershipDetails: {
    properties: {
      customerNumber: {
        type: 'string',
      },
      memberId: {
        type: 'string',
      },
      membershipId: {
        type: 'string',
      },
      membershipStartDate: {
        format: 'date',
        type: 'string',
      },
      membershipStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerMergeField: {
    properties: {
      accountMergeDescriptions: {
        $ref: 'GenesisFacadeCustomerMergeFieldDescription',
      },
      campaignMergeDescriptions: {
        $ref: 'GenesisFacadeCustomerMergeFieldDescription',
      },
      communicationMergeDescriptions: {
        $ref: 'GenesisFacadeCustomerMergeFieldDescription',
      },
      opportunityMergeDescriptions: {
        $ref: 'GenesisFacadeCustomerMergeFieldDescription',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerMergeFieldDescription: {
    properties: {
      links: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      mergeMode: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerParticipationInfo: {
    properties: {
      employments: {
        items: {
          $ref: 'GenesisFacadeCustomerEmploymentDetails',
        },
        type: 'array',
      },
      memberships: {
        items: {
          $ref: 'GenesisFacadeCustomerMembershipDetails',
        },
        type: 'array',
      },
      students: {
        items: {
          $ref: 'GenesisFacadeCustomerStudentDetails',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerPhone: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      consentDate: {
        format: 'date',
        type: 'string',
      },
      consentStatus: {
        type: 'string',
      },
      consentStatusDeniedReason: {
        type: 'string',
      },
      consentToTextDate: {
        format: 'date',
        type: 'string',
      },
      consentToTextStatus: {
        type: 'string',
      },
      consentToTextStatusDeniedReason: {
        type: 'string',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      duration: {
        format: 'int',
        type: 'integer',
      },
      effectiveFrom: {
        format: 'date',
        type: 'string',
      },
      effectiveTo: {
        format: 'date',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      preferredDaysToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      preferredInd: {
        type: 'boolean',
      },
      preferredTimesToContact: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      temporary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerProductOwned: {
    properties: {
      carrierNameCd: {
        type: 'string',
      },
      carrierNameDescription: {
        type: 'string',
      },
      policyExpirationDate: {
        format: 'date',
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyTypeCd: {
        type: 'string',
      },
      productOwnedId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerReference: {
    properties: {
      customerNumber: {
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerRelationship: {
    properties: {
      answer: {
        type: 'string',
      },
      authorisationOption: {
        type: 'string',
      },
      challengeQuestionCd: {
        type: 'string',
      },
      designatedComment: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      passwordPassphrase: {
        type: 'string',
      },
      passwordReminder: {
        type: 'string',
      },
      relationshipCustomerNumber: {
        type: 'string',
      },
      relationshipDescription: {
        type: 'string',
      },
      relationshipRole: {
        type: 'string',
      },
      serviceRole: {
        type: 'boolean',
      },
      serviceRoleCds: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerRelationshipGroups: {
    properties: {
      assignmentRelationships: {
        items: {
          $ref: 'GenesisFacadeCustomerRelationship',
        },
        type: 'array',
      },
      orgStructRelationships: {
        items: {
          $ref: 'GenesisFacadeCustomerRelationship',
        },
        type: 'array',
      },
      personalRelationships: {
        items: {
          $ref: 'GenesisFacadeCustomerRelationship',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerScheduledUpdateRequest: {
    properties: {
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerSocialNet: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
      socialNetId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerStudentDetails: {
    properties: {
      customerNumber: {
        type: 'string',
      },
      divisionId: {
        type: 'string',
      },
      fieldOfStudy: {
        type: 'string',
      },
      studentAthlete: {
        type: 'boolean',
      },
      studentId: {
        type: 'string',
      },
      studentStartDate: {
        format: 'date',
        type: 'string',
      },
      studentStatus: {
        type: 'string',
      },
      studentType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerUpdateStatusRequest: {
    properties: {
      customerStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeCustomerWebAddress: {
    properties: {
      comment: {
        type: 'string',
      },
      communicationPreferences: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      contactMethod: {
        type: 'string',
      },
      contactType: {
        type: 'string',
      },
      doNotSolicitInd: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
      webAddress: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeDesignatedContact: {
    properties: {
      agent: {
        type: 'string',
      },
      contactPhone: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeMergeCustomersRequest: {
    properties: {
      fieldsToMerge: {
        $ref: 'GenesisFacadeCustomerMergeField',
      },
      mergeFromCustomerNumber: {
        type: 'string',
      },
      mergedCustomer: {
        $ref: 'GenesisFacadeCustomerDetails',
      },
    },
    type: 'object',
  },
  GenesisFacadePolicySummary: {
    properties: {
      currencyCode: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      expired: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      instanceName: {
        type: 'string',
      },
      lob: {
        type: 'string',
      },
      lobCd: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      pendingRevisionNumber: {
        format: 'int',
        type: 'integer',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      productCode: {
        type: 'string',
      },
      productVersion: {
        format: 'double',
        type: 'number',
      },
      renewable: {
        type: 'boolean',
      },
      revisionNumber: {
        format: 'int',
        type: 'integer',
      },
      rootEntityType: {
        type: 'string',
      },
      timedPolicyStatusCd: {
        type: 'string',
      },
      totalPremium: {
        format: 'double',
        type: 'number',
      },
      transactionEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      transactionType: {
        type: 'string',
      },
      transactionTypeCd: {
        type: 'string',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeScheduledUpdate: {
    properties: {
      customer: {
        $ref: 'GenesisFacadeCustomerDetails',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeTaskDetails: {
    properties: {
      actionPerformer: {
        type: 'object',
      },
      actions: {
        $ref: 'TaskActions',
      },
      additionalInfo: {
        type: 'object',
      },
      agencyCd: {
        type: 'string',
      },
      assignment: {
        $ref: 'TaskAssignment',
      },
      baseEntity: {
        $ref: 'EntityReference',
      },
      brandCd: {
        type: 'string',
      },
      businessName: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdByDisplayValue: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerId: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      customerRevisionNo: {
        format: 'int',
        type: 'integer',
      },
      description: {
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      escalated: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      lastPerformer: {
        type: 'string',
      },
      lastPerformerDisplayValue: {
        type: 'string',
      },
      localizedEntityTypes: {
        type: 'object',
      },
      middleName: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      permission: {
        type: 'object',
      },
      priority: {
        type: 'object',
      },
      processAttachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      processInstanceId: {
        type: 'string',
      },
      status: {
        type: 'object',
      },
      subentity: {
        $ref: 'EntityReference',
      },
      taskAttachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      taskEntityDisplayValue: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      warningDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFacadeTaskSummary: {
    properties: {
      actions: {
        $ref: 'TaskActions',
      },
      agencyCd: {
        type: 'string',
      },
      assignment: {
        $ref: 'TaskAssignment',
      },
      baseEntity: {
        $ref: 'EntityReference',
      },
      brandCd: {
        type: 'string',
      },
      businessName: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdByDisplayValue: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerId: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      customerRevisionNo: {
        format: 'int',
        type: 'integer',
      },
      description: {
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      escalated: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      lastPerformer: {
        type: 'string',
      },
      lastPerformerDisplayValue: {
        type: 'string',
      },
      localizedEntityTypes: {
        type: 'object',
      },
      middleName: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      permission: {
        type: 'object',
      },
      priority: {
        type: 'object',
      },
      status: {
        type: 'object',
      },
      subentity: {
        $ref: 'EntityReference',
      },
      taskEntityDisplayValue: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      warningDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      caseNumber: {
        type: 'string',
      },
      date: {
        format: 'date',
        type: 'string',
      },
      needed: {
        type: 'boolean',
      },
      reason: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicy: {},
  GenesisFleetPolicyAddress: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisGeoposition',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyAssignedDriver: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      assignDriverType: {
        type: 'string',
      },
      driver: {
        $ref: 'GenesisDriver',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
      percentOfUsage: {
        format: 'int',
        type: 'integer',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      totalNumberOfDrivers: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyBlobInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      blobCd: {
        type: 'string',
      },
      coverages: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      forms: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      lobs: {
        items: {
          $ref: 'GenesisFleetPolicyLobInfo',
        },
        type: 'array',
      },
      offerStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyDriverInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisClaimInfo',
        },
        type: 'array',
      },
      companyEmployee: {
        type: 'boolean',
      },
      companyEmployeeNumber: {
        type: 'string',
      },
      continuouslyWithCompany: {
        format: 'date',
        type: 'string',
      },
      convictedOfFelonyInd: {
        type: 'boolean',
      },
      driverType: {
        type: 'string',
      },
      fillingInfo: {
        $ref: 'GenesisFillingInfo',
      },
      included: {
        type: 'boolean',
      },
      licenseInfo: {
        items: {
          $ref: 'GenesisLicenseInfo',
        },
        type: 'array',
      },
      reportsOrdered: {
        type: 'boolean',
      },
      studentInfo: {
        $ref: 'GenesisStudentInfo',
      },
      suspensions: {
        items: {
          $ref: 'GenesisSuspensionInfo',
        },
        type: 'array',
      },
      trainingCompletionDate: {
        format: 'date',
        type: 'string',
      },
      underwritingInfo: {
        $ref: 'GenesisFleetPolicyUnderwritingInfo',
      },
      violations: {
        items: {
          $ref: 'GenesisViolationInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyHistoryDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      numberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast2Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast3Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPast4Years: {
        format: 'int',
        type: 'integer',
      },
      numberOfVehiclesPastYear: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyLobInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      lobCd: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      riskItems: {
        items: {
          $ref: 'GenesisFleetPolicyRiskItem',
        },
        type: 'array',
      },
      sequences: {
        items: {
          $ref: 'GenesisPolicySequence',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyOfferManagementUpdateRequest: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelRootKey',
      },
      quote: {
        $ref: 'GenesisFleetPolicy',
      },
      userOperations: {
        items: {
          $ref: 'GenesisPolicyUserOperations',
        },
        type: 'array',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyOwner: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      creditScoreInfo: {
        $ref: 'GenesisCreditScoreInfo',
      },
      driverInfo: {
        $ref: 'GenesisFleetPolicyDriverInfo',
      },
      insuredInfo: {
        $ref: 'GenesisInsuredInfo',
      },
      organizationInfoDetails: {
        $ref: 'GenesisFleetPolicyPartyOrganizationDetails',
      },
      partyInfo: {
        $ref: 'GenesisFleetPolicyPartyInfo',
      },
      personInfo: {
        $ref: 'GenesisFleetPolicyPersonInfo',
      },
      priorCarrierInfo: {
        $ref: 'GenesisPriorCarrierInfo',
      },
      relationToPrimaryInsured: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'GenesisRole',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      creditScoreInfo: {
        $ref: 'GenesisCreditScoreInfo',
      },
      driverInfo: {
        $ref: 'GenesisFleetPolicyDriverInfo',
      },
      insuredInfo: {
        $ref: 'GenesisInsuredInfo',
      },
      organizationInfoDetails: {
        $ref: 'GenesisFleetPolicyPartyOrganizationDetails',
      },
      partyInfo: {
        $ref: 'GenesisFleetPolicyPartyInfo',
      },
      personInfo: {
        $ref: 'GenesisFleetPolicyPersonInfo',
      },
      priorCarrierInfo: {
        $ref: 'GenesisPriorCarrierInfo',
      },
      relationToPrimaryInsured: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'GenesisRole',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPartyInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisFleetPolicyAddress',
        },
        type: 'array',
      },
      age: {
        format: 'int',
        type: 'integer',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisFleetPolicyPersonDetails',
      },
      salutation: {
        type: 'string',
      },
      sameHomeAddress: {
        type: 'boolean',
      },
      ssn: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPartyOrganizationDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        $ref: 'GenesisFleetPolicyAddress',
      },
      organizationInfo: {
        $ref: 'GenesisFleetPolicyPartyOrganizationInfo',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPartyOrganizationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAutoCommunicationInfo',
        },
        type: 'array',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      publicName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      taxIdentificationId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPerson: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPersonDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAutoCommunicationInfo',
        },
        type: 'array',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      legalIdentities: {
        items: {
          $ref: 'GenesisPersonLegalIdentity',
        },
        type: 'array',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPersonInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisFleetPolicyAddress',
        },
        type: 'array',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisFleetPolicyPerson',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyPrefillInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisFleetPolicyAddress',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      gender: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyRiskItem: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      claims: {
        items: {
          $ref: 'GenesisClaimInfo',
        },
        type: 'array',
      },
      code: {
        type: 'string',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      fleetHistory: {
        $ref: 'GenesisFleetPolicyHistoryDetails',
      },
      fleetUnderwritingInfo: {
        $ref: 'GenesisFleetPolicyRiskItemUnderwritingInfo',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      sequences: {
        items: {
          $ref: 'GenesisPolicySequence',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      totalNumberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicles: {
        items: {
          $ref: 'GenesisFleetPolicyVehicle',
        },
        type: 'array',
      },
      vehiclesGroups: {
        items: {
          $ref: 'GenesisFleetPolicyVehicleGroup',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyRiskItemUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      isFeetManagementSystem: {
        type: 'boolean',
      },
      isSecurityPositionAppointed: {
        type: 'boolean',
      },
      isUsingMaintenanceProgram: {
        type: 'boolean',
      },
      maintenanceFrequency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      driverTraining: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      isChildrenCustody: {
        type: 'boolean',
      },
      isFelonyConvicted: {
        type: 'boolean',
      },
      isIncomeFarmingDerived: {
        type: 'boolean',
      },
      isLivingWithParents: {
        type: 'boolean',
      },
      isOnParentsPolicy: {
        type: 'boolean',
      },
      isParentsInsuredRelatedCompany: {
        type: 'boolean',
      },
      residentFor: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyVehicle: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      coverageGroups: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      individualVehicleLink: {
        $ref: 'GenesisRefLink',
      },
      offerStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyVehicleBaseDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      adjustedValue: {
        $ref: 'GenesisMoney',
      },
      adjustmentToValue: {
        format: 'int',
        type: 'integer',
      },
      airBagStatusCd: {
        type: 'string',
      },
      antiLockBrakeCd: {
        type: 'string',
      },
      armoredInd: {
        type: 'boolean',
      },
      automaticBeltsInd: {
        type: 'boolean',
      },
      biSymbol: {
        type: 'string',
      },
      bodyTypeCd: {
        type: 'string',
      },
      collSymbol: {
        type: 'string',
      },
      compSymbol: {
        type: 'string',
      },
      costNew: {
        $ref: 'GenesisMoney',
      },
      daytimeRunningLampsInd: {
        type: 'boolean',
      },
      enginePower: {
        format: 'int',
        type: 'integer',
      },
      firstRegistrationYear: {
        format: 'int',
        type: 'integer',
      },
      fuelTypeCd: {
        type: 'string',
      },
      liabSymbol: {
        type: 'string',
      },
      make: {
        type: 'string',
      },
      manufactureYear: {
        format: 'int',
        type: 'integer',
      },
      marketValue: {
        $ref: 'GenesisMoney',
      },
      model: {
        type: 'string',
      },
      modelYear: {
        format: 'int',
        type: 'integer',
      },
      noVinReasonCd: {
        type: 'string',
      },
      otherUsage: {
        type: 'string',
      },
      pdSymbol: {
        type: 'string',
      },
      performanceCd: {
        type: 'string',
      },
      pipMedSymbol: {
        type: 'string',
      },
      plateNumber: {
        type: 'string',
      },
      purchasedDate: {
        format: 'date',
        type: 'string',
      },
      purchasedNew: {
        type: 'boolean',
      },
      recoveryDeviceInd: {
        type: 'boolean',
      },
      registeredOwner: {
        $ref: 'GenesisFleetPolicyOwner',
      },
      registeredStateCd: {
        type: 'string',
      },
      registrationRecords: {
        items: {
          $ref: 'GenesisRegistrationRecords',
        },
        type: 'array',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      securityOptionsCd: {
        type: 'string',
      },
      series: {
        type: 'string',
      },
      seriesCd: {
        type: 'string',
      },
      statedAmt: {
        $ref: 'GenesisMoney',
      },
      typeCd: {
        type: 'string',
      },
      usageCd: {
        type: 'string',
      },
      usageDescription: {
        type: 'string',
      },
      usagePercent: {
        format: 'int',
        type: 'integer',
      },
      vehSymbol: {
        type: 'string',
      },
      vehicleIdentificationNumber: {
        type: 'string',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyVehicleDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      adjustedValue: {
        $ref: 'GenesisMoney',
      },
      annualMiles: {
        format: 'int',
        type: 'integer',
      },
      assignedDrivers: {
        items: {
          $ref: 'GenesisFleetPolicyAssignedDriver',
        },
        type: 'array',
      },
      businessUseDescription: {
        type: 'string',
      },
      businessUseInd: {
        type: 'boolean',
      },
      code: {
        type: 'string',
      },
      damageDescription: {
        type: 'string',
      },
      declaredAnnualMiles: {
        format: 'int',
        type: 'integer',
      },
      distanceForPleasurePerWeek: {
        format: 'int',
        type: 'integer',
      },
      distanceOneWay: {
        format: 'int',
        type: 'integer',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      existingDamage: {
        type: 'boolean',
      },
      farmOrRanchDisc: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      forms: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      garageParked: {
        type: 'boolean',
      },
      garagingAddress: {
        $ref: 'GenesisFleetPolicyAddress',
      },
      grouped: {
        type: 'boolean',
      },
      included: {
        type: 'boolean',
      },
      isGaragingAddressSameAsInsured: {
        type: 'boolean',
      },
      isKitCar: {
        type: 'boolean',
      },
      marketValue: {
        $ref: 'GenesisMoney',
      },
      marketValueOriginal: {
        $ref: 'GenesisMoney',
      },
      marketValueOverride: {
        $ref: 'GenesisMoney',
      },
      numDaysDrivenPerWeek: {
        format: 'int',
        type: 'integer',
      },
      odometerReading: {
        format: 'int',
        type: 'integer',
      },
      odometerReadingDate: {
        format: 'date',
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      percentageOverrideAmount: {
        format: 'int',
        type: 'integer',
      },
      plateNumber: {
        type: 'string',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      registeredAtDmv: {
        type: 'boolean',
      },
      registrationType: {
        type: 'string',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      sequences: {
        items: {
          $ref: 'GenesisPolicySequence',
        },
        type: 'array',
      },
      series: {
        type: 'string',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicleBaseDetails: {
        $ref: 'GenesisFleetPolicyVehicleBaseDetails',
      },
      vehicleUnderwritingInfo: {
        $ref: 'GenesisFleetPolicyVehicleUnderwritingInfo',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyVehicleGroup: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      assignedVehicles: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      code: {
        type: 'string',
      },
      coverageGroups: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      excludeFromHighLevelOverride: {
        type: 'boolean',
      },
      excludeFromTotal: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      forms: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      groupType: {
        type: 'string',
      },
      numberOfVehicles: {
        format: 'int',
        type: 'integer',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      percentageOverrideAmount: {
        format: 'int',
        type: 'integer',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisFleetPolicyVehicleUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      isAutoSalesAgency: {
        type: 'boolean',
      },
      isCompanyCar: {
        type: 'boolean',
      },
      isEmergencyServices: {
        type: 'boolean',
      },
      isOfficeUse: {
        type: 'boolean',
      },
      isParkingOperations: {
        type: 'boolean',
      },
      isPublicTransportation: {
        type: 'boolean',
      },
      isRacing: {
        type: 'boolean',
      },
      isRentalToOthers: {
        type: 'boolean',
      },
      isRepairServiceStation: {
        type: 'boolean',
      },
      isVehicleCommercialUsed: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisFleetQuoteDetailsWithActions: {
    properties: {
      availableCommands: {
        type: 'object',
      },
      entity: {
        $ref: 'GenesisAgentPolicyFleetFleetAuto_FleetAutoPolicySummary',
      },
    },
    type: 'object',
  },
  GenesisGeoCoord: {
    properties: {
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisGeoCoordEntity: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        type: 'number',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisGeoposition: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      coordAccuracy: {
        format: 'double',
        type: 'number',
      },
      latitude: {
        format: 'double',
        type: 'number',
      },
      longitude: {
        format: 'double',
        type: 'number',
      },
    },
    type: 'object',
  },
  GenesisGroupInfo: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      groupId: {
        type: 'string',
      },
      groupName: {
        type: 'string',
      },
      groupType: {
        type: 'string',
      },
      negotiatedPolicyExpiration: {
        format: 'date',
        type: 'string',
      },
      rootId: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisGroupInfoCreateRequest: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      groupName: {
        type: 'string',
      },
      groupType: {
        type: 'string',
      },
      negotiatedPolicyExpiration: {
        format: 'date',
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisIndividualCustomer: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      additionalNames: {
        items: {
          $ref: 'GenesisCustomerAdditionalName',
        },
        type: 'array',
      },
      assignmentRelationships: {
        items: {
          $ref: 'GenesisCustomerRelationship',
        },
        type: 'array',
      },
      associateBusinessEntity: {
        type: 'boolean',
      },
      billingInfos: {
        items: {
          $ref: 'GenesisCustomerBillingInfo',
        },
        type: 'array',
      },
      businessEntities: {
        items: {
          $ref: 'GenesisCustomerBusinessEntity',
        },
        type: 'array',
      },
      claimInfos: {
        items: {
          $ref: 'GenesisCustomerClaimInfo',
        },
        type: 'array',
      },
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      customerGroupInfos: {
        items: {
          $ref: 'GenesisCustomerGroupInfo',
        },
        type: 'array',
      },
      customerNumber: {
        type: 'string',
      },
      details: {
        $ref: 'GenesisCustomerIndividualDetails',
      },
      employmentDetails: {
        items: {
          $ref: 'GenesisCustomerEmploymentDetails',
        },
        type: 'array',
      },
      majorAccount: {
        $ref: 'GenesisLink',
      },
      majorAccountId: {
        type: 'string',
      },
      majorAccountName: {
        type: 'string',
      },
      participationInfo: {
        $ref: 'GenesisParticipationInfo',
      },
      personalRelationships: {
        items: {
          $ref: 'GenesisCustomerRelationship',
        },
        type: 'array',
      },
      preferredCurrency: {
        type: 'string',
      },
      prevRevNo: {
        format: 'int',
        type: 'integer',
      },
      productsOwned: {
        items: {
          $ref: 'GenesisCustomerProductOwned',
        },
        type: 'array',
      },
      rating: {
        type: 'string',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      state: {
        type: 'string',
      },
      taxExempt: {
        type: 'boolean',
      },
      taxExemptComment: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisIndividualCustomerScheduledUpdate: {
    properties: {
      customer: {
        $ref: 'GenesisIndividualCustomer',
      },
      customerKey: {
        type: 'string',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisIndividualCustomerScheduledUpdateCreateRequest: {
    properties: {
      customer: {
        $ref: 'GenesisIndividualCustomer',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisInsuredInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      clueReport: {
        $ref: 'GenesisReportInfo',
      },
      mvrReport: {
        $ref: 'GenesisReportInfo',
      },
      personalAutoInsuredMembership: {
        $ref: 'GenesisPersonalAutoInsuredMembership',
      },
      primary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisLegalEntity: {
    properties: {
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      industryCd: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      publicName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      taxIdentificationId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLegalEntityParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      auxiliaryData: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      publicName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      taxIdentificationId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLicenseInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      ageFirstLicensed: {
        format: 'int',
        type: 'integer',
      },
      dateFirstLicensed: {
        format: 'date',
        type: 'string',
      },
      dateLicensed: {
        format: 'date',
        type: 'string',
      },
      licenseClass: {
        type: 'string',
      },
      licenseNumber: {
        type: 'string',
      },
      licenseStateCd: {
        type: 'string',
      },
      licenseStatusCd: {
        type: 'string',
      },
      licenseTypeCd: {
        type: 'string',
      },
      permitBeforeLicense: {
        type: 'boolean',
      },
      revocationPending: {
        type: 'boolean',
      },
      totalDriverExpYears: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisLink: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLinkDTO: {
    properties: {
      _uri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLobInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      lobCd: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      riskItems: {
        items: {
          $ref: 'GenesisRiskItem',
        },
        type: 'array',
      },
      sequences: {
        items: {
          $ref: 'GenesisPolicySequence',
        },
        type: 'array',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisLocation: {
    properties: {
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisCustomerGeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLocationParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      auxiliaryData: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisGeoCoordEntity',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisLoginDimension: {
    properties: {
      dimensionCd: {
        type: 'string',
      },
      dimensionValues: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      unrestricted: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisLoginProfile: {
    properties: {
      authorities: {
        items: {
          $ref: 'GenesisAuthority',
        },
        type: 'array',
      },
      authorityLevel: {
        format: 'int',
        type: 'integer',
      },
      channel: {
        type: 'string',
      },
      roles: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      username: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisMVRReport: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accidentCity: {
        type: 'string',
      },
      accidentDate: {
        format: 'date',
        type: 'string',
      },
      accidentState: {
        type: 'string',
      },
      convictionDate: {
        format: 'date',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      faultIndicator: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      infractionType: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      licenseNo: {
        type: 'string',
      },
      licenseState: {
        type: 'string',
      },
      licenseStatus: {
        type: 'string',
      },
      occurrenceDate: {
        format: 'date',
        type: 'string',
      },
      points: {
        format: 'int',
        type: 'integer',
      },
      registryTypeId: {
        type: 'string',
      },
      relatedTypeId: {
        type: 'string',
      },
      suspensionRevocationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisMajorAccount: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      accountId: {
        type: 'string',
      },
      designation: {
        type: 'string',
      },
      managers: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      rootId: {
        type: 'string',
      },
      serviceLevel: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisMajorAccountCreateRequest: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      designation: {
        type: 'string',
      },
      managers: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
      serviceLevel: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisMembershipCustomerAssociation: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisMembershipDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisMembershipCustomerAssociation',
      },
      memberId: {
        type: 'string',
      },
      membershipId: {
        type: 'string',
      },
      membershipStartDate: {
        format: 'date',
        type: 'string',
      },
      membershipStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisMoney: {
    properties: {
      amount: {
        type: 'number',
      },
      currency: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOpportunity: {
    properties: {
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      actualPremium: {
        type: 'number',
      },
      agency: {
        type: 'string',
      },
      campaignId: {
        type: 'string',
      },
      channel: {
        type: 'string',
      },
      closeReason: {
        type: 'string',
      },
      closeReasonDescription: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      id: {
        type: 'string',
      },
      likelihood: {
        type: 'string',
      },
      opportunityId: {
        type: 'string',
      },
      owner: {
        $ref: 'GenesisOpportunityOwnerLink',
      },
      potential: {
        type: 'number',
      },
      products: {
        items: {
          $ref: 'GenesisOpportunityProductInfo',
        },
        type: 'array',
      },
      referral: {
        $ref: 'GenesisLink',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOpportunityOwnerLink: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOpportunityProductInfo: {
    properties: {
      lineOfBusiness: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganization: {
    properties: {
      assignedRoles: {
        items: {
          $ref: 'GenesisOrganizationRole',
        },
        type: 'array',
      },
      details: {
        $ref: 'GenesisOrganizationDetails',
      },
      name: {
        type: 'string',
      },
      organizationCd: {
        type: 'string',
      },
      organizationId: {
        type: 'string',
      },
      parent: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisOrganizationAdditionalName: {
    properties: {
      dbaName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationAddress: {
    properties: {
      address: {
        $ref: 'GenesisOrganizationLocation',
      },
      usageTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationAssignment: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      organization: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisOrganizationBrand: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      brandCd: {
        type: 'string',
      },
      brandName: {
        type: 'string',
      },
      brandType: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationCustomer: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      additionalNames: {
        items: {
          $ref: 'GenesisOrganizationAdditionalName',
        },
        type: 'array',
      },
      anonymous: {
        type: 'boolean',
      },
      assignmentRelationships: {
        items: {
          $ref: 'GenesisCustomerRelationship',
        },
        type: 'array',
      },
      billingInfos: {
        items: {
          $ref: 'GenesisCustomerBillingInfo',
        },
        type: 'array',
      },
      claimInfos: {
        items: {
          $ref: 'GenesisCustomerClaimInfo',
        },
        type: 'array',
      },
      communicationInfo: {
        $ref: 'GenesisCustomerCommunicationInfo',
      },
      customerGroupInfos: {
        items: {
          $ref: 'GenesisCustomerGroupInfo',
        },
        type: 'array',
      },
      customerNumber: {
        type: 'string',
      },
      details: {
        $ref: 'GenesisOrganizationCustomerBusinessDetails',
      },
      divisions: {
        items: {
          $ref: 'GenesisCrmDivision',
        },
        type: 'array',
      },
      entityTypes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      groupSponsor: {
        type: 'boolean',
      },
      majorAccount: {
        $ref: 'GenesisLink',
      },
      majorAccountId: {
        type: 'string',
      },
      majorAccountName: {
        type: 'string',
      },
      numberOfEmployees: {
        format: 'int',
        type: 'integer',
      },
      orgStructRelationships: {
        items: {
          $ref: 'GenesisCustomerRelationship',
        },
        type: 'array',
      },
      preferredCurrency: {
        type: 'string',
      },
      prevRevNo: {
        format: 'int',
        type: 'integer',
      },
      productsOwned: {
        items: {
          $ref: 'GenesisCustomerProductOwned',
        },
        type: 'array',
      },
      referenceCategories: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
      segments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      state: {
        type: 'string',
      },
      taxExempt: {
        type: 'boolean',
      },
      taxExemptComment: {
        type: 'string',
      },
      useAsReference: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisOrganizationCustomerBusinessDetails: {
    properties: {
      businessName: {
        type: 'string',
      },
      businessType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      legalEntity: {
        $ref: 'GenesisLegalEntity',
      },
      naicsCode: {
        type: 'string',
      },
      naicsDescription: {
        type: 'string',
      },
      naicsIndustryGroup: {
        type: 'string',
      },
      naicsSector: {
        type: 'string',
      },
      naicsSubSector: {
        type: 'string',
      },
      numberOfContinuous: {
        format: 'int',
        type: 'integer',
      },
      paperless: {
        type: 'boolean',
      },
      preferredSpokenLanguage: {
        type: 'string',
      },
      preferredWrittenLanguage: {
        type: 'string',
      },
      registerOnline: {
        type: 'boolean',
      },
      sicCode: {
        type: 'string',
      },
      sicDescription: {
        type: 'string',
      },
      sicDivision: {
        type: 'string',
      },
      sicIndustry: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationCustomerScheduledUpdate: {
    properties: {
      customer: {
        $ref: 'GenesisOrganizationCustomer',
      },
      customerKey: {
        type: 'string',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationCustomerScheduledUpdateCreateRequest: {
    properties: {
      customer: {
        $ref: 'GenesisOrganizationCustomer',
      },
      updateDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationDetails: {
    properties: {
      legalEntityBase: {
        $ref: 'GenesisOrganizationLegal',
      },
      organizationAddress: {
        items: {
          $ref: 'GenesisOrganizationAddress',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisOrganizationLegal: {
    properties: {
      businessName: {
        type: 'string',
      },
      businessType: {
        type: 'string',
      },
      communicationInfo: {
        $ref: 'GenesisCommunicationInfo',
      },
      dateStarted: {
        format: 'date',
        type: 'string',
      },
      dbaName: {
        type: 'string',
      },
      industryCd: {
        type: 'string',
      },
      legalId: {
        type: 'string',
      },
      legalName: {
        type: 'string',
      },
      publicName: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      taxIdentificationId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationLocation: {
    properties: {
      accuracy: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      geoposition: {
        $ref: 'GenesisGeoCoord',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationRole: {
    properties: {
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      roleDetails: {
        $ref: 'OrganizationRoleDetails',
      },
      roleTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisOrganizationalPerson: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      organizationAssignments: {
        items: {
          $ref: 'GenesisOrganizationAssignment',
        },
        type: 'array',
      },
      organizationalPersonId: {
        type: 'string',
      },
      personInfo: {
        $ref: 'GenesisPerson',
      },
      securityIdentity: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPackagingDetail: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      declineVariationInd: {
        type: 'boolean',
      },
      declineVariationReason: {
        type: 'string',
      },
      packageCd: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisParticipationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      employments: {
        items: {
          $ref: 'GenesisEmploymentDetails',
        },
        type: 'array',
      },
      memberships: {
        items: {
          $ref: 'GenesisMembershipDetails',
        },
        type: 'array',
      },
      students: {
        items: {
          $ref: 'GenesisStudentDetails',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisPartiesAuxiliaryQueryRequest: {
    properties: {
      auxiliaryQuery: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      creditScoreInfo: {
        $ref: 'GenesisCreditScoreInfo',
      },
      driverInfo: {
        $ref: 'GenesisDriverInfo',
      },
      insuredInfo: {
        $ref: 'GenesisInsuredInfo',
      },
      personInfo: {
        $ref: 'GenesisPersonInfo',
      },
      priorCarrierInfo: {
        $ref: 'GenesisPriorCarrierInfo',
      },
      relationToPrimaryInsured: {
        type: 'string',
      },
      roles: {
        items: {
          $ref: 'GenesisRole',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisPerson: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        $ref: 'GenesisCommunicationInfo',
      },
      deceased: {
        type: 'string',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      gender: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      legalIdentities: {
        items: {
          $ref: 'GenesisPersonLegalIdentity',
        },
        type: 'array',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      titleCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPersonBase: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      communicationInfo: {
        items: {
          $ref: 'GenesisAutoCommunicationInfo',
        },
        type: 'array',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      legalIdentities: {
        items: {
          $ref: 'GenesisPersonLegalIdentity',
        },
        type: 'array',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPersonInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressInfo: {
        items: {
          $ref: 'GenesisPolicyAddress',
        },
        type: 'array',
      },
      age: {
        format: 'int',
        type: 'integer',
      },
      employer: {
        type: 'string',
      },
      employmentStatus: {
        type: 'string',
      },
      nameTypeCd: {
        type: 'string',
      },
      occupation: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      otherName: {
        type: 'string',
      },
      personBaseDetails: {
        $ref: 'GenesisPersonBase',
      },
      salutation: {
        type: 'string',
      },
      sameHomeAddress: {
        type: 'boolean',
      },
      ssn: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPersonLegalIdentity: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      legalIdentityType: {
        type: 'string',
      },
      legalIdentityValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPersonParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      auxiliaryData: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      deceased: {
        type: 'boolean',
      },
      deceasedDate: {
        format: 'date',
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      maritalStatus: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPersonalAutoInsuredMembership: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      membershipNo: {
        format: 'int',
        type: 'integer',
      },
      organizationCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPhoneInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      updatedOn: {
        format: 'date-time',
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPipeflowEntityWithPremiumsResponse: {
    properties: {
      entity: {
        $ref: 'GenesisCommonPolicy',
      },
      premiums: {
        $ref: 'GenesisPremiumsDetails',
      },
    },
    type: 'object',
  },
  GenesisPolicyAddress: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      addressLine1: {
        type: 'string',
      },
      addressLine2: {
        type: 'string',
      },
      addressLine3: {
        type: 'string',
      },
      addressType: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      county: {
        type: 'string',
      },
      doNotSolicit: {
        type: 'boolean',
      },
      geoposition: {
        $ref: 'GenesisGeoposition',
      },
      nationalId: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      stateProvinceCd: {
        type: 'string',
      },
      streetAddress: {
        type: 'string',
      },
      streetName: {
        type: 'string',
      },
      streetNumber: {
        type: 'string',
      },
      unitNumber: {
        type: 'string',
      },
      zipPlus4Code: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyApplicabilityOverride: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelType: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      acceptReason: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      applicabilityAction: {
        type: 'string',
      },
      applicabilityType: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entryPoint: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      overriddenEntityId: {
        type: 'string',
      },
      overriddenEntityType: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      policy: {
        $ref: 'GenesisLink',
      },
      state: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyApplicabilityOverrideAcceptRequest: {
    properties: {
      _key: {
        $ref: 'GenesisPolicyKey',
      },
      acceptReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyApplicabilityOverrideDeclineRequest: {
    properties: {
      _key: {
        $ref: 'GenesisPolicyKey',
      },
      declineReason: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyBankAccountInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      accountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      routingNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyBillingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisPolicyAddress',
      },
      bankAccountInfo: {
        $ref: 'GenesisPolicyBankAccountInfo',
      },
      communicationInfo: {
        $ref: 'GenesisAutoCommunicationInfo',
      },
      creditCardInfo: {
        $ref: 'GenesisPolicyCreditCardDetails',
      },
      paperless: {
        type: 'boolean',
      },
      paymentAmt: {
        $ref: 'GenesisMoney',
      },
      paymentAuthorized: {
        type: 'boolean',
      },
      paymentMethod: {
        type: 'string',
      },
      recurringPayment: {
        type: 'boolean',
      },
      sameBillingAddress: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisPolicyBusinessDimensions: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      agency: {
        type: 'string',
      },
      brand: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyContextDetails: {
    properties: {
      entryPoint: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyCreditCardDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      cardNumber: {
        type: 'string',
      },
      cardType: {
        type: 'string',
      },
      cvv: {
        format: 'int',
        type: 'integer',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyDecisionTable: {
    properties: {
      rows: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      tableName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      archivedAtPolicyRevision: {
        format: 'int',
        type: 'integer',
      },
      cancelNotice: {
        type: 'boolean',
      },
      cancelNoticeDate: {
        format: 'date-time',
        type: 'string',
      },
      cancelNoticeDays: {
        format: 'int',
        type: 'integer',
      },
      cancelNoticeOtherReason: {
        type: 'string',
      },
      cancelNoticeReason: {
        type: 'string',
      },
      currentQuoteInd: {
        type: 'boolean',
      },
      declineDate: {
        format: 'date-time',
        type: 'string',
      },
      declineOtherReason: {
        type: 'string',
      },
      declineReason: {
        type: 'string',
      },
      doNotRenew: {
        type: 'boolean',
      },
      doNotRenewOtherReason: {
        type: 'string',
      },
      doNotRenewReason: {
        type: 'string',
      },
      doNotRenewStatus: {
        type: 'string',
      },
      followUpRequired: {
        type: 'boolean',
      },
      manualRenew: {
        type: 'boolean',
      },
      manualRenewOtherReason: {
        type: 'string',
      },
      manualRenewReason: {
        type: 'string',
      },
      oosProcessingStage: {
        type: 'string',
      },
      printNotice: {
        type: 'boolean',
      },
      proposeNotes: {
        type: 'string',
      },
      supportingData: {
        type: 'string',
      },
      suspendDate: {
        format: 'date-time',
        type: 'string',
      },
      suspendOtherReason: {
        type: 'string',
      },
      suspendReason: {
        type: 'string',
      },
      versionDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyDocument: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      deliveryMethod: {
        type: 'string',
      },
      divert: {
        type: 'boolean',
      },
      divertTo: {
        type: 'string',
      },
      divertType: {
        type: 'string',
      },
      noGenerationType: {
        type: 'string',
      },
      noPrintType: {
        type: 'string',
      },
      paymentPlanAuth: {
        type: 'string',
      },
      policyApplication: {
        type: 'boolean',
      },
      suppressGeneration: {
        type: 'boolean',
      },
      suppressPrint: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisPolicyEvaluateTableRequest: {
    properties: {
      category: {
        type: 'string',
      },
      evaluateRequest: {
        $ref: 'GenesisAutoPolicyEvaluateDetails',
      },
      flowRequestId: {
        type: 'string',
      },
      tableName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyKey: {
    properties: {
      revisionNo: {
        format: 'int',
        type: 'integer',
      },
      rootId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyLink: {
    properties: {
      policyUri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyOfferManagementManager: {
    properties: {
      entryPoint: {
        type: 'string',
      },
      flowRequestId: {
        type: 'string',
      },
      manager: {
        type: 'string',
      },
      quote: {
        $ref: 'GenesisAutoPolicy',
      },
    },
    type: 'object',
  },
  GenesisPolicyPaymentPlan: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      code: {
        type: 'string',
      },
      dueDate: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisPolicyPremiumEntry: {
    properties: {
      actualAmount: {
        $ref: 'GenesisMoney',
      },
      addedAmount: {
        $ref: 'GenesisMoney',
      },
      changeAmount: {
        $ref: 'GenesisMoney',
      },
      factor: {
        format: 'int',
        type: 'integer',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'string',
      },
      returnedAmount: {
        $ref: 'GenesisMoney',
      },
      reversedAmount: {
        $ref: 'GenesisMoney',
      },
      termAmount: {
        $ref: 'GenesisMoney',
      },
    },
    type: 'object',
  },
  GenesisPolicySequence: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      collection: {
        type: 'string',
      },
      max: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisPolicyTerm: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      contractTermTypeCd: {
        type: 'string',
      },
      termCd: {
        type: 'string',
      },
      termEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      termExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      termNo: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  GenesisPolicyTotalPremiumDetails: {
    properties: {
      actualAmount: {
        $ref: 'GenesisMoney',
      },
      changeAmount: {
        $ref: 'GenesisMoney',
      },
      premiumCode: {
        type: 'string',
      },
      premiumType: {
        type: 'string',
      },
      termAmount: {
        $ref: 'GenesisMoney',
      },
    },
    type: 'object',
  },
  GenesisPolicyUnderwritingMeasure: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      accessTrackInfo: {
        $ref: 'GenesisAccessTrackInfo',
      },
      category: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      name: {
        type: 'string',
      },
      policy: {
        $ref: 'GenesisLink',
      },
      reason: {
        type: 'string',
      },
      ruleConditionExpression: {
        type: 'string',
      },
      ruleContext: {
        type: 'string',
      },
      ruleEntryPoint: {
        type: 'string',
      },
      ruleExpression: {
        type: 'string',
      },
      ruleMessage: {
        type: 'string',
      },
      ruleMessageId: {
        type: 'string',
      },
      ruleName: {
        type: 'string',
      },
      ruleSeverity: {
        type: 'string',
      },
      ruleType: {
        type: 'string',
      },
      ruleUsageType: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      targetEntity: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPolicyUserOperations: {
    properties: {
      entity: {
        type: 'object',
      },
      path: {
        type: 'string',
      },
      userOperationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPrefillInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      address: {
        $ref: 'GenesisPolicyAddress',
      },
      dob: {
        format: 'date',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      gender: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
      policyState: {
        type: 'string',
      },
      skipped: {
        type: 'boolean',
      },
      used: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisPremiumHolderAttribute: {
    properties: {
      attributeData: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      attributeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisPremiumsDetails: {
    properties: {
      id: {
        format: 'uuid',
        type: 'string',
      },
      premiumEntries: {
        items: {
          $ref: 'GenesisPolicyPremiumEntry',
        },
        type: 'array',
      },
      premiumHolderAttributes: {
        items: {
          $ref: 'GenesisPremiumHolderAttribute',
        },
        type: 'array',
      },
      premiumHolderCode: {
        type: 'string',
      },
      premiumHolderType: {
        type: 'string',
      },
      statusCd: {
        type: 'string',
      },
      totals: {
        items: {
          $ref: 'GenesisPolicyTotalPremiumDetails',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisPreparePurchaseRequest: {
    properties: {
      policyUri: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisPriorCarrierInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      carrierCd: {
        type: 'string',
      },
      carrierName: {
        type: 'string',
      },
      carrierPolicyExpDate: {
        format: 'date',
        type: 'string',
      },
      carrierPolicyNo: {
        type: 'string',
      },
      carrierPremium: {
        $ref: 'GenesisMoney',
      },
      deductibles: {
        $ref: 'GenesisMoney',
      },
      limitsBiPd: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisQuoteCommonPurchaseRequest: {
    properties: {
      billingInfo: {
        type: 'object',
      },
      policyUri: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisQuotePurchaseRequest: {
    properties: {
      billingInfo: {
        type: 'object',
      },
    },
    type: 'object',
  },
  GenesisRefLink: {
    properties: {
      _ref: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisRegistrationRecords: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      licensePlateNumber: {
        type: 'string',
      },
      registrationDate: {
        format: 'date',
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisReportInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      bandNumber: {
        type: 'string',
      },
      order: {
        type: 'boolean',
      },
      orderDate: {
        format: 'date',
        type: 'string',
      },
      ordered: {
        type: 'boolean',
      },
      receiptDate: {
        format: 'date',
        type: 'string',
      },
      reorder: {
        type: 'boolean',
      },
      response: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisRiskItem: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      additionalInterests: {
        items: {
          $ref: 'GenesisAdditionalInterest',
        },
        type: 'array',
      },
      adjustedValue: {
        $ref: 'GenesisMoney',
      },
      adjustmentToValue: {
        format: 'int',
        type: 'integer',
      },
      annualMiles: {
        format: 'int',
        type: 'integer',
      },
      assignedDrivers: {
        items: {
          $ref: 'GenesisAssignedDriver',
        },
        type: 'array',
      },
      biSymbol: {
        type: 'string',
      },
      businessUseDescription: {
        type: 'string',
      },
      businessUseInd: {
        type: 'boolean',
      },
      costNew: {
        $ref: 'GenesisMoney',
      },
      coverageGroups: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      coverages: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      damageDescription: {
        type: 'string',
      },
      declaredAnnualMiles: {
        format: 'int',
        type: 'integer',
      },
      distanceForPleasurePerWeek: {
        format: 'int',
        type: 'integer',
      },
      distanceOneWay: {
        format: 'int',
        type: 'integer',
      },
      existingDamage: {
        type: 'boolean',
      },
      farmOrRanchDisc: {
        type: 'boolean',
      },
      flatOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      forms: {
        items: {
          type: 'object',
        },
        type: 'array',
      },
      garageParked: {
        type: 'boolean',
      },
      garagingAddress: {
        $ref: 'GenesisPolicyAddress',
      },
      included: {
        type: 'boolean',
      },
      isGaragingAddressSameAsInsured: {
        type: 'boolean',
      },
      isKitCar: {
        type: 'boolean',
      },
      liabSymbol: {
        type: 'string',
      },
      marketValue: {
        $ref: 'GenesisMoney',
      },
      marketValueOriginal: {
        $ref: 'GenesisMoney',
      },
      marketValueOverride: {
        $ref: 'GenesisMoney',
      },
      numDaysDrivenPerWeek: {
        format: 'int',
        type: 'integer',
      },
      odometerReading: {
        format: 'int',
        type: 'integer',
      },
      odometerReadingDate: {
        format: 'date',
        type: 'string',
      },
      offerStatus: {
        type: 'string',
      },
      overrideOtherReason: {
        type: 'string',
      },
      overrideReason: {
        type: 'string',
      },
      overwriteOverrideAmount: {
        $ref: 'GenesisMoney',
      },
      pdSymbol: {
        type: 'string',
      },
      percentageOverrideAmount: {
        type: 'number',
      },
      pipMedSymbol: {
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      plateNumber: {
        type: 'string',
      },
      prefilled: {
        type: 'boolean',
      },
      premiumOverrideType: {
        type: 'string',
      },
      propagateOverride: {
        type: 'boolean',
      },
      registeredAtDmv: {
        type: 'boolean',
      },
      registeredOwner: {
        $ref: 'GenesisDriver',
      },
      registeredStateCd: {
        type: 'string',
      },
      registrationType: {
        type: 'string',
      },
      seqNo: {
        format: 'int',
        type: 'integer',
      },
      series: {
        type: 'string',
      },
      startTerm: {
        format: 'int',
        type: 'integer',
      },
      statedAmt: {
        $ref: 'GenesisMoney',
      },
      validForTerms: {
        format: 'int',
        type: 'integer',
      },
      vehicleBaseDetails: {
        $ref: 'GenesisAutoVehicleDetails',
      },
      vehicleUnderwritingInfo: {
        $ref: 'GenesisVehicleUnderwritingInfo',
      },
      vinMatch: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisRole: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      role: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisRoleProfile: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      assignedRoles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      modelScopes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSaga: {
    properties: {
      _key: {
        $ref: 'GenesisSagaKey',
      },
      ownedLocks: {
        items: {
          $ref: 'GenesisApiModelKey',
        },
        type: 'array',
      },
      reachedFinalStateAt: {
        format: 'date-time',
        type: 'string',
      },
      response: {
        type: 'object',
      },
      revertStatus: {
        type: 'string',
      },
      startedAt: {
        format: 'date-time',
        type: 'string',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSagaInnerError: {
    properties: {
      code: {
        type: 'string',
      },
      details: {
        type: 'object',
      },
      errors: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      logReference: {
        type: 'string',
      },
      message: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSagaKey: {
    properties: {
      sagaId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSagaRequestData: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
    },
    type: 'object',
  },
  GenesisSagaStep: {
    properties: {
      _key: {
        $ref: 'GenesisSagaStepKey',
      },
      commandName: {
        type: 'string',
      },
      lastFailure: {
        $ref: 'GenesisSagaInnerError',
      },
      lastUpdate: {
        format: 'date-time',
        type: 'string',
      },
      modelName: {
        type: 'string',
      },
      operatingEntityKey: {
        $ref: 'GenesisApiModelRootKey',
      },
      requestData: {
        $ref: 'GenesisSagaRequestData',
      },
      revertStatus: {
        type: 'string',
      },
      stepStatus: {
        type: 'string',
      },
      variation: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSagaStepKey: {
    properties: {
      sagaId: {
        type: 'string',
      },
      stepId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSagaStepRequest: {
    properties: {
      requestData: {
        $ref: 'GenesisSagaRequestData',
      },
      stepId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSchedulingContactInfo: {
    properties: {
      effectiveFrom: {
        format: 'date',
        type: 'string',
      },
      effectiveTo: {
        format: 'date',
        type: 'string',
      },
      temporary: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisSecurityDomain: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      dimensionProfiles: {
        items: {
          $ref: 'GenesisDimensionProfile',
        },
        type: 'array',
      },
      domainCd: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      parentRef: {
        $ref: 'GenesisLink',
      },
      roleProfiles: {
        items: {
          $ref: 'GenesisRoleProfile',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisSecurityPrivilege: {
    properties: {
      applicableResourceCd: {
        type: 'string',
      },
      privilegeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisSecurityRole: {
    properties: {
      applicableResourceCd: {
        type: 'string',
      },
      assignedPrivileges: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      assignedRoles: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      roleName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisStudentCustomerAssociation: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      link: {
        $ref: 'GenesisLink',
      },
    },
    type: 'object',
  },
  GenesisStudentDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      customer: {
        $ref: 'GenesisStudentCustomerAssociation',
      },
      divisionId: {
        type: 'string',
      },
      fieldOfStudy: {
        type: 'string',
      },
      studentAthlete: {
        type: 'boolean',
      },
      studentId: {
        type: 'string',
      },
      studentStartDate: {
        format: 'date',
        type: 'string',
      },
      studentStatus: {
        type: 'string',
      },
      studentType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisStudentInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      awayAtSchool: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      over100MilesFromHome: {
        type: 'boolean',
      },
      publicTransportationDiscount: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisSuspensionInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      reinstatementDate: {
        format: 'date',
        type: 'string',
      },
      suspensionDate: {
        format: 'date',
        type: 'string',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisTransactionDetails: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      txCreateDate: {
        format: 'date-time',
        type: 'string',
      },
      txEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      txOtherReason: {
        type: 'string',
      },
      txReasonCd: {
        type: 'string',
      },
      txType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      driverTraining: {
        type: 'boolean',
      },
      goodStudent: {
        type: 'boolean',
      },
      isChildrenCustody: {
        type: 'boolean',
      },
      isFelonyConvicted: {
        type: 'boolean',
      },
      isIncomeFarmingDerived: {
        type: 'boolean',
      },
      isLivingWithParents: {
        type: 'boolean',
      },
      isOnParentsPolicy: {
        type: 'boolean',
      },
      isParentsInsuredRelatedCompany: {
        type: 'boolean',
      },
      residentFor: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisUser: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      authorityLevel: {
        format: 'int',
        type: 'integer',
      },
      userProfiles: {
        items: {
          $ref: 'GenesisUserProfile',
        },
        type: 'array',
      },
      uuid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisUserOperationalAssignment: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      dimensionAccessProfile: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      roleAccessProfile: {
        items: {
          $ref: 'GenesisLink',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  GenesisUserProfile: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      defaultInd: {
        type: 'boolean',
      },
      effectiveDate: {
        format: 'date',
        type: 'string',
      },
      expirationDate: {
        format: 'date',
        type: 'string',
      },
      operationalAssignments: {
        items: {
          $ref: 'GenesisUserOperationalAssignment',
        },
        type: 'array',
      },
      profileId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisVehicleParty: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _modelName: {
        type: 'string',
      },
      _modelVersion: {
        type: 'string',
      },
      _timestamp: {
        type: 'string',
      },
      _type: {
        type: 'string',
      },
      auxiliaryData: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
      make: {
        type: 'string',
      },
      manufactureYear: {
        format: 'int',
        type: 'integer',
      },
      mergedFrom: {
        $ref: 'GenesisLink',
      },
      mergedTo: {
        $ref: 'GenesisLink',
      },
      model: {
        type: 'string',
      },
      modelYear: {
        format: 'int',
        type: 'integer',
      },
      registryEntityNumber: {
        type: 'string',
      },
      registryTypeId: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      vehicleIdentificationNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  GenesisVehicleUnderwritingInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      isAutoSalesAgency: {
        type: 'boolean',
      },
      isCompanyCar: {
        type: 'boolean',
      },
      isEmergencyServices: {
        type: 'boolean',
      },
      isOfficeUse: {
        type: 'boolean',
      },
      isParkingOperations: {
        type: 'boolean',
      },
      isPublicTransportation: {
        type: 'boolean',
      },
      isRacing: {
        type: 'boolean',
      },
      isRentalToOthers: {
        type: 'boolean',
      },
      isRepairServiceStation: {
        type: 'boolean',
      },
      isVehicleCommercialUsed: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  GenesisViolationInfo: {
    properties: {
      _key: {
        $ref: 'GenesisApiModelKey',
      },
      _type: {
        type: 'string',
      },
      convictionDate: {
        format: 'date',
        type: 'string',
      },
      exclusionReason: {
        type: 'string',
      },
      includeInRating: {
        type: 'boolean',
      },
      violationCode: {
        type: 'string',
      },
      violationCodeDesc: {
        type: 'string',
      },
      violationPoints: {
        type: 'string',
      },
      violationType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  HealthCheckStatistics: {
    properties: {
      apiCallsAverageRequestTime: {
        format: 'int',
        type: 'integer',
      },
      apiCallsCompleted: {
        format: 'int',
        type: 'integer',
      },
      apiCallsPending: {
        format: 'int',
        type: 'integer',
      },
      responses: {
        type: 'object',
      },
    },
    type: 'object',
  },
  HoldReason: {
    properties: {
      holdCategoryCd: {
        type: 'string',
      },
      holdReasonCd: {
        type: 'string',
      },
      holdReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  HoldType: {
    properties: {
      holdTypeCd: {
        type: 'string',
      },
      holdTypeDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  InboxShared: {
    properties: {
      sharedInbox: {
        type: 'string',
      },
      sharedWithUsers: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  IndividualDetails: {
    properties: {
      associateBusinessEntity: {
        type: 'boolean',
      },
      associateEmployments: {
        type: 'boolean',
      },
      associateProviders: {
        type: 'boolean',
      },
      birthDate: {
        format: 'date',
        type: 'string',
      },
      citizenshipCd: {
        type: 'string',
      },
      deathDate: {
        format: 'date',
        type: 'string',
      },
      deathNotificationReceived: {
        type: 'boolean',
      },
      deceased: {
        type: 'boolean',
      },
      designationCd: {
        type: 'string',
      },
      designationDescription: {
        type: 'string',
      },
      disabilities: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      genderCd: {
        type: 'string',
      },
      interests: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      lastName: {
        type: 'string',
      },
      maritalStatusCd: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      nickname: {
        type: 'string',
      },
      occupationCd: {
        type: 'string',
      },
      occupationDescription: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      taxId: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      tobaccoCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  InstallmentStartDatesRequest: {
    properties: {
      billingType: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      createNewAccount: {
        type: 'boolean',
      },
      downPaymentAmountChange: {
        type: 'number',
      },
      dueDayConfig: {
        $ref: 'DueDayConfig',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      planCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      riskStateCd: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
      txTypeName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  InsurableRiskHeader: {
    properties: {
      displayValue: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Invoice: {
    properties: {
      dueDate: {
        format: 'date',
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  IsbaStatisticsResponse: {
    properties: {
      gatewayEndpoints: {
        type: 'object',
      },
    },
    type: 'object',
  },
  ItemizedLoss: {
    properties: {
      associatedScheduledItemOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      estimatedValue: {
        type: 'number',
      },
      extension: {
        type: 'object',
      },
      item: {
        type: 'string',
      },
    },
    type: 'object',
  },
  LogLevel: {
    properties: {
      level: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Lookup: {
    properties: {
      name: {
        type: 'string',
      },
      values: {
        items: {
          $ref: 'LookupItem',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  LookupItem: {
    properties: {
      code: {
        type: 'string',
      },
      defaultValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  LookupValues: {
    properties: {
      name: {
        type: 'string',
      },
      values: {
        items: {
          additionalProperties: {
            type: 'object',
          },
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  Loss: {
    properties: {
      addresses: {
        items: {
          $ref: 'AgentClaimAddress',
        },
        type: 'array',
      },
      associatedRiskItemOid: {
        type: 'string',
      },
      componentName: {
        type: 'string',
      },
      damageDesc: {
        type: 'string',
      },
      extension: {
        type: 'object',
      },
      lossDesc: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      parties: {
        items: {
          $ref: 'ClaimParty',
        },
        type: 'array',
      },
      partyType: {
        type: 'string',
      },
      riskItemOid: {
        type: 'string',
      },
      severityCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ManualTaskDefinition: {
    properties: {
      count: {
        format: 'int',
        type: 'integer',
      },
      definitions: {
        items: {
          $ref: 'ManualTaskDefinitionBasicInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  ManualTaskDefinitionBasicInfo: {
    properties: {
      allowTaskProcessSuspense: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      dueDateTime: {
        format: 'date-time',
        type: 'string',
      },
      duePeriod: {
        $ref: 'ManualTaskDefinitionPeriodInfo',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityType: {
        type: 'object',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      preferredQueue: {
        $ref: 'ManualTaskDefinitionQueueInfo',
      },
      priority: {
        type: 'object',
      },
      processKey: {
        type: 'string',
      },
      warningDateTime: {
        format: 'date-time',
        type: 'string',
      },
      warningPeriod: {
        $ref: 'ManualTaskDefinitionPeriodInfo',
      },
    },
    type: 'object',
  },
  ManualTaskDefinitionPeriodInfo: {
    properties: {
      days: {
        format: 'int',
        type: 'integer',
      },
      hours: {
        format: 'int',
        type: 'integer',
      },
      minutes: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  ManualTaskDefinitionQueueInfo: {
    properties: {
      disabled: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      privRead: {
        type: 'string',
      },
      privWrite: {
        type: 'string',
      },
      subsystem: {
        type: 'string',
      },
    },
    type: 'object',
  },
  NonPersonPartyAdditionalName: {
    properties: {
      businessName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  OrganizationRoleDetails: {
    type: 'object',
  },
  PartyEntityReference: {
    properties: {
      eisNavigationReference: {
        type: 'string',
      },
      entityClass: {
        type: 'string',
      },
      entityId: {
        type: 'string',
      },
      entityLob: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      partyRole: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PartyRef: {
    properties: {
      displayValue: {
        type: 'string',
      },
      refId: {
        type: 'string',
      },
      typeCd: {
        enum: ['PARTY', 'VENDOR'],
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetails: {
    properties: {
      cheque: {
        $ref: 'PaymentDetailsCheque',
      },
      eft: {
        $ref: 'PaymentDetailsEFT',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsCashDTO: {
    properties: {
      extensionFields: {
        type: 'object',
      },
      profileId: {
        type: 'string',
      },
      referenceNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsCheque: {
    properties: {
      address: {
        $ref: 'ClaimsAddress',
      },
      checkNumber: {
        type: 'string',
      },
      manualInd: {
        type: 'boolean',
      },
      paymentDeliveryMethodCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsChequeDTO: {
    properties: {
      bankAccountNumber: {
        type: 'string',
      },
      bankCode: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      chequeDate: {
        format: 'date-time',
        type: 'string',
      },
      chequeNumber: {
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      payeeName: {
        type: 'string',
      },
      profileId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsCreditCardDTO: {
    properties: {
      billingAddress: {
        $ref: 'BillingAddressDTO',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      fullName: {
        type: 'string',
      },
      fullNumber: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetailsDTO',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsDTO: {
    properties: {
      cash: {
        $ref: 'PaymentDetailsCashDTO',
      },
      cheque: {
        $ref: 'PaymentDetailsChequeDTO',
      },
      creditCard: {
        $ref: 'PaymentDetailsCreditCardDTO',
      },
      eft: {
        $ref: 'PaymentDetailsEftDTO',
      },
      pciCreditCard: {
        $ref: 'PaymentDetailsPciCreditCardDTO',
      },
      savedPaymentMethod: {
        $ref: 'PaymentMethodDTO',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsEFT: {
    properties: {
      bankAccountNumber: {
        type: 'string',
      },
      bankTransitNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsEftDTO: {
    properties: {
      accountHolderInfo: {
        $ref: 'BillingNameInfoDTO',
      },
      accountNumber: {
        type: 'string',
      },
      accountTypeCd: {
        type: 'string',
      },
      bankAccountHolderName: {
        type: 'string',
      },
      bankAccountHolderNamePhonetic: {
        type: 'string',
      },
      bankAccountType: {
        type: 'string',
      },
      bankBranchCd: {
        type: 'string',
      },
      bankCd: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      effectiveTerm: {
        $ref: 'BillingEffectiveTermDTO',
      },
      eftProtocolFormReceived: {
        type: 'boolean',
      },
      extensionFields: {
        type: 'object',
      },
      firstName: {
        type: 'string',
      },
      internationalAchFormatting: {
        type: 'boolean',
      },
      lastName: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetailsDTO',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      statusUpdatedBy: {
        type: 'string',
      },
      transitNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDetailsPciCreditCardDTO: {
    properties: {
      billingAddress: {
        $ref: 'BillingAddressDTO',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      fullName: {
        type: 'string',
      },
      fullNumber: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      payorDetails: {
        $ref: 'BillingPayorDetailsDTO',
      },
      payorDifferent: {
        type: 'boolean',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentDistribution: {
    properties: {
      adjustReserveInd: {
        type: 'boolean',
      },
      allocationType: {
        type: 'string',
      },
      amount: {
        type: 'number',
      },
      exGratiaDetails: {
        $ref: 'ExGratiaDetails',
      },
      exGratiaInd: {
        type: 'boolean',
      },
      featureOid: {
        type: 'string',
      },
      finalPaymentInd: {
        type: 'boolean',
      },
      reserveTypeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PaymentMethodDTO: {
    properties: {
      accountNumber: {
        type: 'string',
      },
      bankName: {
        type: 'string',
      },
      creditCardType: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      issuedBy: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      paymentMethodEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      paymentMethodExpirationDate: {
        format: 'date-time',
        type: 'string',
      },
      profileId: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PerformanceSummary: {
    properties: {
      createdOpportunities: {
        format: 'int',
        type: 'integer',
      },
      createdOpportunitiesByStatus: {
        $ref: 'CreatedOpportunitiesSummary',
      },
      policiesIssued: {
        format: 'int',
        type: 'integer',
      },
      quotesCreated: {
        format: 'int',
        type: 'integer',
      },
      targetedLeads: {
        format: 'int',
        type: 'integer',
      },
      totalPolicyPremium: {
        type: 'number',
      },
      totalQuotePremium: {
        type: 'number',
      },
    },
    type: 'object',
  },
  PersonPartyAdditionalName: {
    properties: {
      designationCd: {
        type: 'string',
      },
      designationDescription: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      salutation: {
        type: 'string',
      },
      suffix: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PhoneContact: {
    properties: {
      phone: {
        type: 'string',
      },
      phoneTypeCd: {
        type: 'string',
      },
      preferredInd: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  PolicyAllocation: {
    properties: {
      balanceDue: {
        $ref: 'AgentMoney',
      },
      billingAccountNumber: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      grossMinimumDue: {
        $ref: 'AgentMoney',
      },
      netMinimumDue: {
        $ref: 'AgentMoney',
      },
      policyNumber: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PolicyCancelNoticeRequest: {
    properties: {
      cancelNoticeReasonCd: {
        type: 'string',
      },
      daysOfNotice: {
        format: 'int',
        type: 'integer',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      fullTermEffectiveDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  PolicyDeductible: {
    properties: {
      appliesToCd: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
      value: {
        type: 'object',
      },
    },
    type: 'object',
  },
  PolicyHold: {
    properties: {
      additionalInfo: {
        type: 'string',
      },
      billingContact: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      holdName: {
        type: 'string',
      },
      holdTypes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      multipleHolds: {
        type: 'boolean',
      },
      reasonCode: {
        type: 'string',
      },
      reasonDisplayValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PolicyLimit: {
    properties: {
      appliesToCd: {
        type: 'string',
      },
      appliesToDisplayValue: {
        type: 'string',
      },
      typeCd: {
        type: 'string',
      },
      value: {
        type: 'object',
      },
    },
    type: 'object',
  },
  PolicyRiskItem: {
    properties: {
      address: {
        $ref: 'AgentPolicyAddress',
      },
      assignedParties: {
        items: {
          $ref: 'AgentPolicyParty',
        },
        type: 'array',
      },
      coverages: {
        items: {
          $ref: 'AgentPolicyCoverage',
        },
        type: 'array',
      },
      description: {
        type: 'string',
      },
      oid: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  PolicyTerm: {
    properties: {
      billableAmount: {
        $ref: 'AgentMoney',
      },
      billingStatus: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      brokerCd: {
        type: 'string',
      },
      countryCd: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      extensionFields: {
        type: 'object',
      },
      ignoredByNsfCancellation: {
        type: 'boolean',
      },
      minimumDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      nsfCount: {
        format: 'int',
        type: 'integer',
      },
      paidThrough: {
        format: 'date-time',
        type: 'string',
      },
      parentPolicyTerm: {
        $ref: 'AgentBillablePolicyTermDetails',
      },
      pastDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      paymentPlan: {
        type: 'string',
      },
      policyFlag: {
        type: 'string',
      },
      policyNumber: {
        type: 'string',
      },
      policyStatusCd: {
        type: 'string',
      },
      policyType: {
        type: 'string',
      },
      prepaidAmount: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      productCd: {
        type: 'string',
      },
      riskState: {
        type: 'string',
      },
      statusRepresentation: {
        type: 'string',
      },
      totalDue: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      totalPaid: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      totalWrittenPremium: {
        $ref: 'AgentBillingMoneyAdditionalDetailed',
      },
      txReason: {
        type: 'string',
      },
      txReasonText: {
        type: 'string',
      },
      underwriterCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ProcessDefinition: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      processKey: {
        type: 'string',
      },
      processName: {
        type: 'string',
      },
      processNameDisplay: {
        type: 'string',
      },
      processType: {
        type: 'string',
      },
    },
    type: 'object',
  },
  ProductDefinition: {
    properties: {
      activated: {
        type: 'boolean',
      },
      broadLobCd: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      effective: {
        format: 'date-time',
        type: 'string',
      },
      expiration: {
        format: 'date-time',
        type: 'string',
      },
      lobCd: {
        type: 'string',
      },
      productCd: {
        type: 'string',
      },
      productName: {
        type: 'string',
      },
      productType: {
        enum: ['CLAIM', 'POLICY'],
        type: 'string',
      },
      productVersion: {
        format: 'int',
        type: 'integer',
      },
      subLobCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  QueueInfo: {
    properties: {
      disabled: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      privRead: {
        type: 'string',
      },
      privWrite: {
        type: 'string',
      },
      subsystem: {
        type: 'string',
      },
    },
    type: 'object',
  },
  QueueSummary: {
    properties: {
      code: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      permissions: {
        type: 'object',
      },
    },
    type: 'object',
  },
  QuickFilter: {
    properties: {
      extension: {
        type: 'object',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      name: {
        type: 'string',
      },
      nameDisplayValue: {
        type: 'string',
      },
      owner: {
        type: 'string',
      },
      ownerDisplayValue: {
        type: 'string',
      },
      parameters: {
        $ref: 'QuickFilterParameters',
        description: 'Filter parameters.',
      },
      permission: {
        $ref: 'QuickFilterPermission',
        description: 'Available actions which current user can perform for Task Quick filter.',
      },
    },
    type: 'object',
  },
  QuickFilterCreate: {
    properties: {
      extension: {
        type: 'object',
      },
      name: {
        type: 'string',
      },
      parameters: {
        $ref: 'QuickFilterParameters',
        description: 'Filter parameters.',
      },
    },
    type: 'object',
  },
  QuickFilterParameters: {
    properties: {
      dueDateAfter: {
        format: 'date-time',
        type: 'string',
      },
      dueDateBefore: {
        format: 'date-time',
        type: 'string',
      },
      entityRefNo: {
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      priority: {
        format: 'int',
        type: 'integer',
      },
      status: {
        type: 'string',
      },
      taskCreationDateAfter: {
        format: 'date-time',
        type: 'string',
      },
      taskCreationDateBefore: {
        format: 'date-time',
        type: 'string',
      },
      warningDateAfter: {
        format: 'date-time',
        type: 'string',
      },
      warningDateBefore: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  QuickFilterPermission: {
    properties: {
      remove: {
        type: 'boolean',
      },
      update: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  QuickFilterUpdate: {
    properties: {
      extension: {
        type: 'object',
      },
      name: {
        type: 'string',
      },
      parameters: {
        $ref: 'QuickFilterParameters',
        description: 'Filter parameters.',
      },
    },
    type: 'object',
  },
  RefundReason: {
    properties: {
      refundDescription: {
        type: 'string',
      },
      refundReasonCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  Reserve: {
    properties: {
      amount: {
        $ref: 'ClaimMoney',
      },
      typeCd: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityAuthorityLevelDto: {
    properties: {
      level: {
        format: 'int',
        type: 'integer',
      },
      product: {
        type: 'string',
      },
      subType: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SecuritySubordinateDto: {
    properties: {
      availableForWork: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityUserProfileCreateDto: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      billingAuthorityLevel: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      claimsAuthorityLevel: {
        type: 'string',
      },
      commissionable: {
        type: 'boolean',
      },
      countryCd: {
        type: 'string',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      domain: {
        enum: ['corporate', 'vendor', 'agency'],
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      faxNumber: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      roleNames: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sellsInsuranceProducts: {
        type: 'boolean',
      },
      signatureURI: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
      userExtensionDTO: {
        $ref: 'SecurityUserProfileExtensionDto',
        description:
          'Placeholder for project specific fields. Full path of extended DTO class must be declared on @class property and pass as it would be one of DTO field.',
      },
      userLogin: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      userStatus: {
        enum: ['Available', 'Unavailable', 'Disabled'],
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityUserProfileDto: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      lastName: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      subProducer: {
        type: 'string',
      },
      userLogin: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      userWorkStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityUserProfileExtensionDto: {
    type: 'object',
  },
  SecurityUserProfileInfoDto: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      authorityLevels: {
        items: {
          $ref: 'SecurityAuthorityLevelDto',
        },
        type: 'array',
      },
      category: {
        type: 'string',
      },
      claimsAuthorityLevel: {
        type: 'string',
      },
      commissionable: {
        type: 'boolean',
      },
      countryCd: {
        type: 'string',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      faxNumber: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      jobTitle: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      sellsInsuranceProducts: {
        type: 'boolean',
      },
      signatureURI: {
        type: 'string',
      },
      subProducer: {
        type: 'string',
      },
      userLogin: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      userTimeZone: {
        type: 'string',
      },
      userWorkStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityUserProfileUpdateDto: {
    properties: {
      agencyCodes: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      billingAuthorityLevel: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
      claimsAuthorityLevel: {
        type: 'string',
      },
      commissionable: {
        type: 'boolean',
      },
      countryCd: {
        type: 'string',
      },
      defaultAgencyCode: {
        type: 'string',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      email: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      faxNumber: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      jobTitle: {
        type: 'string',
      },
      languageCd: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      phoneExtension: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      restrictAccess: {
        type: 'boolean',
      },
      roleNames: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      sellsInsuranceProducts: {
        type: 'boolean',
      },
      signatureURI: {
        type: 'string',
      },
      userExtensionDTO: {
        $ref: 'SecurityUserProfileExtensionDto',
        description:
          'Placeholder for project specific fields. Full path of extended DTO class must be declared on @class property and pass as it would be one of DTO field.',
      },
      userStatus: {
        enum: ['Available', 'Unavailable', 'Disabled'],
        type: 'string',
      },
    },
    type: 'object',
  },
  SecurityUserRef: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      agencyName: {
        type: 'string',
      },
      availableForWork: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      fullLoginName: {
        type: 'string',
      },
      fullName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      locationCd: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
      userName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SharedInbox: {
    properties: {
      actions: {
        $ref: 'SharedInboxActions',
      },
      displayValue: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      workStatus: {
        type: 'string',
      },
      workStatusDisplayValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  SharedInboxActions: {
    properties: {
      remove: {
        $ref: 'ActionMetadata',
      },
    },
    type: 'object',
  },
  SharedInboxInfo: {
    properties: {
      sharedInbox: {
        $ref: 'UserInfo',
      },
      sharedWithUsers: {
        items: {
          $ref: 'SharedInbox',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  TaskActionHistory: {
    properties: {
      actionType: {
        type: 'string',
      },
      actionTypeDisplayValue: {
        type: 'string',
      },
      executedOn: {
        format: 'date-time',
        type: 'string',
      },
      id: {
        format: 'int',
        type: 'integer',
      },
      note: {
        type: 'string',
      },
      performer: {
        type: 'string',
      },
      performerDisplayValue: {
        type: 'string',
      },
      reason: {
        type: 'string',
      },
      reasonDisplayValue: {
        type: 'string',
      },
      taskId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskActions: {
    properties: {
      assign: {
        $ref: 'ActionMetadata',
      },
      complete: {
        $ref: 'ActionMetadata',
      },
      link: {
        $ref: 'ActionMetadata',
      },
      suspend: {
        $ref: 'ActionMetadata',
      },
      unlink: {
        $ref: 'ActionMetadata',
      },
      update: {
        $ref: 'ActionMetadata',
      },
      updateDueDate: {
        $ref: 'ActionMetadata',
      },
      updateWarningDate: {
        $ref: 'ActionMetadata',
      },
    },
    type: 'object',
  },
  TaskActivity: {
    properties: {
      additionalProperties: {
        type: 'object',
      },
      archived: {
        type: 'boolean',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      description: {
        type: 'string',
      },
      performer: {
        $ref: 'UserSummary',
      },
      status: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskAssignment: {
    properties: {
      assignmentType: {
        type: 'string',
      },
      assignmentValue: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      note: {
        type: 'string',
      },
      queueCode: {
        type: 'string',
      },
      queueDisplayValue: {
        type: 'string',
      },
      userDisplayValue: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskCompletion: {
    properties: {
      completionFields: {
        items: {
          $ref: 'CompletionField',
        },
        type: 'array',
      },
      taskId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskCompletionRequest: {
    properties: {
      completionForm: {
        type: 'object',
      },
      note: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskCreationRequest: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      assignmentType: {
        enum: ['User', 'Queue'],
        type: 'string',
      },
      assignmentValue: {
        type: 'string',
      },
      brandCd: {
        type: 'string',
      },
      datesFromDefinitionInd: {
        type: 'boolean',
      },
      dueDateTime: {
        format: 'date-time',
        type: 'string',
      },
      dueDays: {
        format: 'int',
        type: 'integer',
      },
      dueHours: {
        format: 'int',
        type: 'integer',
      },
      dueMinutes: {
        format: 'int',
        type: 'integer',
      },
      dueTypeDate: {
        enum: ['DATE', 'PERIOD'],
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      note: {
        type: 'string',
      },
      priority: {
        type: 'string',
      },
      processExtensionInfo: {
        type: 'object',
      },
      processKey: {
        type: 'string',
      },
      queueCode: {
        type: 'string',
      },
      referenceId: {
        type: 'string',
      },
      taskDescription: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      userName: {
        type: 'string',
      },
      warningDateTime: {
        format: 'date-time',
        type: 'string',
      },
      warningDays: {
        format: 'int',
        type: 'integer',
      },
      warningHours: {
        format: 'int',
        type: 'integer',
      },
      warningMinutes: {
        format: 'int',
        type: 'integer',
      },
      warningTypeDate: {
        enum: ['DATE', 'PERIOD'],
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskDefinition: {
    properties: {
      allowTaskProcessSuspense: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      dueDateTime: {
        format: 'date-time',
        type: 'string',
      },
      entityType: {
        type: 'object',
      },
      preferredQueue: {
        $ref: 'QueueInfo',
      },
      priority: {
        type: 'object',
      },
      processKey: {
        type: 'string',
      },
      warningDateTime: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskDetails: {
    properties: {
      actionPerformer: {
        type: 'object',
      },
      actions: {
        $ref: 'TaskActions',
      },
      additionalInfo: {
        type: 'object',
      },
      agencyCd: {
        type: 'string',
      },
      assignment: {
        $ref: 'TaskAssignment',
      },
      baseEntity: {
        $ref: 'EntityReference',
      },
      brandCd: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdByDisplayValue: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      escalated: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      lastPerformer: {
        type: 'string',
      },
      lastPerformerDisplayValue: {
        type: 'string',
      },
      localizedEntityTypes: {
        type: 'object',
      },
      name: {
        type: 'string',
      },
      permission: {
        type: 'object',
      },
      priority: {
        type: 'object',
      },
      processAttachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      processInstanceId: {
        type: 'string',
      },
      status: {
        type: 'object',
      },
      subentity: {
        $ref: 'EntityReference',
      },
      taskAttachments: {
        items: {
          type: 'string',
        },
        type: 'array',
      },
      taskEntityDisplayValue: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      warningDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskNoteActions: {
    properties: {
      delete: {
        $ref: 'ActionMetadataDTO',
      },
      update: {
        $ref: 'ActionMetadataDTO',
      },
    },
    type: 'object',
  },
  TaskNoteCreateRequest: {
    properties: {
      category: {
        type: 'string',
      },
      confidential: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskResultStatus: {
    properties: {
      contextDescription: {
        type: 'string',
      },
      messageList: {
        items: {
          $ref: 'AgentMessage',
        },
        type: 'array',
      },
      messagesAsString: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      successful: {
        type: 'boolean',
      },
    },
    type: 'object',
  },
  TaskScheduledInfo: {
    properties: {
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      taskId: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskSummary: {
    properties: {
      actions: {
        $ref: 'TaskActions',
      },
      agencyCd: {
        type: 'string',
      },
      assignment: {
        $ref: 'TaskAssignment',
      },
      baseEntity: {
        $ref: 'EntityReference',
      },
      brandCd: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      createdByDisplayValue: {
        type: 'string',
      },
      creationDate: {
        format: 'date-time',
        type: 'string',
      },
      customerNumber: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      dueDate: {
        format: 'date-time',
        type: 'string',
      },
      escalated: {
        type: 'boolean',
      },
      id: {
        type: 'string',
      },
      lastPerformer: {
        type: 'string',
      },
      lastPerformerDisplayValue: {
        type: 'string',
      },
      localizedEntityTypes: {
        type: 'object',
      },
      name: {
        type: 'string',
      },
      permission: {
        type: 'object',
      },
      priority: {
        type: 'object',
      },
      status: {
        type: 'object',
      },
      subentity: {
        $ref: 'EntityReference',
      },
      taskEntityDisplayValue: {
        type: 'string',
      },
      taskSuspenseInfo: {
        $ref: 'TaskSuspenseInfo',
      },
      warningDate: {
        format: 'date-time',
        type: 'string',
      },
    },
    type: 'object',
  },
  TaskSuspenseInfo: {
    properties: {
      suspenseEndDate: {
        format: 'date-time',
        type: 'string',
      },
      suspenseReason: {
        type: 'string',
      },
      suspenseReasonOther: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TasksNamedFilter: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  TransferPaymentReason: {
    properties: {
      paymentMethodType: {
        type: 'string',
      },
      transferPaymentReasonCd: {
        type: 'string',
      },
      transferPaymentReasonDescription: {
        type: 'string',
      },
    },
    type: 'object',
  },
  UnitGatewayHealthCheckStatistics: {
    properties: {
      apiCallsAverageGatewayLatency: {
        format: 'int',
        type: 'integer',
      },
      apiCallsAverageRequestTime: {
        format: 'int',
        type: 'integer',
      },
      apiCallsCompleted: {
        format: 'int',
        type: 'integer',
      },
      apiCallsPending: {
        format: 'int',
        type: 'integer',
      },
      dataProviders: {
        type: 'object',
      },
      responses: {
        type: 'object',
      },
    },
    type: 'object',
  },
  UserBulletin: {
    properties: {
      category: {
        type: 'object',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      priority: {
        type: 'string',
      },
      status: {
        type: 'object',
      },
      text: {
        type: 'string',
      },
    },
    type: 'object',
  },
  UserInfo: {
    properties: {
      displayValue: {
        type: 'string',
      },
      userName: {
        type: 'string',
      },
      workStatus: {
        type: 'string',
      },
      workStatusDisplayValue: {
        type: 'string',
      },
    },
    type: 'object',
  },
  UserSummary: {
    properties: {
      agencyCd: {
        type: 'string',
      },
      agencyName: {
        type: 'string',
      },
      availableForWork: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      domain: {
        type: 'string',
      },
      empty: {
        type: 'boolean',
      },
      firstName: {
        type: 'string',
      },
      firstNameLastName: {
        type: 'string',
      },
      fullLoginName: {
        type: 'string',
      },
      fullName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      locationCd: {
        type: 'string',
      },
      loginName: {
        type: 'string',
      },
      userId: {
        format: 'int',
        type: 'integer',
      },
      userName: {
        type: 'string',
      },
    },
    type: 'object',
  },
  UserWorkSettingsRest: {
    properties: {
      backupQueue: {
        type: 'string',
      },
      backupQueueDisplayValue: {
        type: 'string',
      },
      backupUserInfo: {
        $ref: 'UserInfo',
      },
      userInfo: {
        $ref: 'UserInfo',
      },
    },
    type: 'object',
  },
  ValidationExceptionDTO: {
    properties: {
      errorCode: {
        type: 'string',
      },
      field: {
        type: 'string',
      },
      message: {
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkDefinitionBasicInfo: {
    properties: {
      allowTaskProcessSuspense: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
      displayValue: {
        type: 'string',
      },
      dueDateTime: {
        format: 'date-time',
        type: 'string',
      },
      duePeriod: {
        $ref: 'WorkPeriodInfo',
      },
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityType: {
        type: 'object',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      preferredQueue: {
        $ref: 'WorkQueueInfo',
      },
      priority: {
        type: 'object',
      },
      processKey: {
        type: 'string',
      },
      warningDateTime: {
        format: 'date-time',
        type: 'string',
      },
      warningPeriod: {
        $ref: 'WorkPeriodInfo',
      },
    },
    type: 'object',
  },
  WorkDefinitionBasicInfoList: {
    properties: {
      count: {
        format: 'int',
        type: 'integer',
      },
      definitions: {
        items: {
          $ref: 'WorkDefinitionBasicInfo',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  WorkPeriodInfo: {
    properties: {
      days: {
        format: 'int',
        type: 'integer',
      },
      hours: {
        format: 'int',
        type: 'integer',
      },
      minutes: {
        format: 'int',
        type: 'integer',
      },
    },
    type: 'object',
  },
  WorkProcessDefinitionInformation: {
    properties: {
      effectiveDate: {
        format: 'date-time',
        type: 'string',
      },
      entityType: {
        type: 'string',
      },
      expirationDate: {
        format: 'date-time',
        type: 'string',
      },
      processKey: {
        type: 'string',
      },
      processName: {
        type: 'string',
      },
      processNameDisplay: {
        type: 'string',
      },
      processType: {
        enum: ['ManualTaskProcess', 'AutomatedProcess'],
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkProfileActions: {
    properties: {
      addDocument: {
        $ref: 'ActionMetadata',
      },
      addInboxSharing: {
        $ref: 'ActionMetadata',
      },
      addNote: {
        $ref: 'ActionMetadata',
      },
      assignToQueue: {
        $ref: 'ActionMetadata',
      },
      assignToUser: {
        $ref: 'ActionMetadata',
      },
      changeAutomatedTaskFields: {
        $ref: 'ActionMetadata',
      },
      changeBackupAssignment: {
        $ref: 'ActionMetadata',
      },
      changeSubordinateWorkStatus: {
        $ref: 'ActionMetadata',
      },
      changeWorkStatus: {
        $ref: 'ActionMetadata',
      },
      createTask: {
        $ref: 'ActionMetadata',
      },
      setNoteAsConfidential: {
        $ref: 'ActionMetadata',
      },
      suspendTask: {
        $ref: 'ActionMetadata',
      },
    },
    type: 'object',
  },
  WorkProfileRest: {
    properties: {
      backupQueue: {
        type: 'string',
      },
      backupUserName: {
        type: 'string',
      },
      workStatus: {
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkQueueInfo: {
    properties: {
      disabled: {
        type: 'boolean',
      },
      displayValue: {
        type: 'string',
      },
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      privRead: {
        type: 'string',
      },
      privWrite: {
        type: 'string',
      },
      subsystem: {
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkTasksNamedFilterInfo: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkValueProvider: {
    properties: {
      key: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
  WorkWorkValueProviderInfo: {
    properties: {
      key: {
        type: 'string',
      },
      value: {
        type: 'string',
      },
    },
    type: 'object',
  },
}
