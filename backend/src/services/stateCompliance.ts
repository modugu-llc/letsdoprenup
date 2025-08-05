export type USState = 'CALIFORNIA' | 'WASHINGTON' | 'NEW_YORK' | 'WASHINGTON_DC' | 'VIRGINIA';

export interface StateRequirement {
  name: string;
  description: string;
  required: boolean;
  waitingPeriod?: number; // in days
}

export interface StateCompliance {
  state: USState;
  displayName: string;
  totalSteps: number;
  requirements: StateRequirement[];
  disclosureRequirements: string[];
  notarizationRequired: boolean;
  witnessRequired: boolean;
  specialRules: string[];
}

export class StateComplianceService {
  private stateCompliances: Record<USState, StateCompliance> = {
    CALIFORNIA: {
      state: 'CALIFORNIA',
      displayName: 'California',
      totalSteps: 8,
      requirements: [
        {
          name: 'Written Agreement',
          description: 'Agreement must be in writing and signed by both parties',
          required: true
        },
        {
          name: 'Voluntary Execution',
          description: 'Both parties must enter the agreement voluntarily',
          required: true
        },
        {
          name: 'Full Disclosure',
          description: 'Complete disclosure of assets, debts, and income',
          required: true
        },
        {
          name: 'Seven-Day Waiting Period',
          description: 'At least 7 days must pass between final agreement and marriage',
          required: true,
          waitingPeriod: 7
        },
        {
          name: 'Independent Legal Representation',
          description: 'Recommended but not required',
          required: false
        }
      ],
      disclosureRequirements: [
        'All assets owned individually',
        'All debts and obligations',
        'Annual income and income sources',
        'Any expected inheritances or gifts'
      ],
      notarizationRequired: false,
      witnessRequired: false,
      specialRules: [
        'Agreements executed less than 7 days before marriage are voidable',
        'Court will examine fairness at time of enforcement',
        'Waiver of spousal support may be scrutinized more closely'
      ]
    },
    WASHINGTON: {
      state: 'WASHINGTON',
      displayName: 'Washington',
      totalSteps: 7,
      requirements: [
        {
          name: 'Written Agreement',
          description: 'Agreement must be in writing and signed by both parties',
          required: true
        },
        {
          name: 'Voluntary Execution',
          description: 'Both parties must enter the agreement voluntarily',
          required: true
        },
        {
          name: 'Full Financial Disclosure',
          description: 'Complete and accurate disclosure of all assets and debts',
          required: true
        },
        {
          name: 'Fair and Reasonable',
          description: 'Agreement must be fair and reasonable when made',
          required: true
        }
      ],
      disclosureRequirements: [
        'Complete list of assets with fair market values',
        'All debts and liabilities',
        'Income information',
        'Any business interests'
      ],
      notarizationRequired: false,
      witnessRequired: false,
      specialRules: [
        'Community property state - agreement affects property rights',
        'Courts will not enforce unconscionable agreements',
        'Full disclosure is strictly required'
      ]
    },
    NEW_YORK: {
      state: 'NEW_YORK',
      displayName: 'New York',
      totalSteps: 8,
      requirements: [
        {
          name: 'Written Agreement',
          description: 'Agreement must be in writing',
          required: true
        },
        {
          name: 'Acknowledgment or Notarization',
          description: 'Agreement must be notarized or acknowledged',
          required: true
        },
        {
          name: 'Fair and Reasonable',
          description: 'Agreement must be fair and reasonable when made and enforced',
          required: true
        },
        {
          name: 'Full Disclosure',
          description: 'Fair disclosure of assets and financial obligations',
          required: true
        },
        {
          name: 'Independent Legal Representation',
          description: 'Highly recommended for validity',
          required: false
        }
      ],
      disclosureRequirements: [
        'Assets and property owned',
        'Income and earning capacity',
        'Debts and financial obligations',
        'Any expected inheritances'
      ],
      notarizationRequired: true,
      witnessRequired: false,
      specialRules: [
        'Agreement must be notarized or properly acknowledged',
        'Courts examine fairness at both execution and enforcement',
        'Cannot completely waive maintenance without meeting strict requirements'
      ]
    },
    WASHINGTON_DC: {
      state: 'WASHINGTON_DC',
      displayName: 'Washington D.C.',
      totalSteps: 7,
      requirements: [
        {
          name: 'Written Agreement',
          description: 'Agreement must be in writing and signed by both parties',
          required: true
        },
        {
          name: 'Voluntary Execution',
          description: 'Both parties must enter the agreement voluntarily',
          required: true
        },
        {
          name: 'UPAA Compliance',
          description: 'Must comply with Uniform Premarital Agreement Act',
          required: true
        },
        {
          name: 'Financial Disclosure',
          description: 'Adequate disclosure of assets and obligations',
          required: true
        }
      ],
      disclosureRequirements: [
        'Assets and property',
        'Debts and financial obligations',
        'Income sources'
      ],
      notarizationRequired: false,
      witnessRequired: false,
      specialRules: [
        'Follows Uniform Premarital Agreement Act',
        'Agreement unconscionable if lacking disclosure',
        'Cannot adversely affect child support'
      ]
    },
    VIRGINIA: {
      state: 'VIRGINIA',
      displayName: 'Virginia',
      totalSteps: 7,
      requirements: [
        {
          name: 'Written Agreement',
          description: 'Agreement must be in writing and signed by both parties',
          required: true
        },
        {
          name: 'Voluntary Execution',
          description: 'Both parties must enter the agreement voluntarily without duress',
          required: true
        },
        {
          name: 'Full and Fair Disclosure',
          description: 'Complete disclosure of assets, debts, and income',
          required: true
        },
        {
          name: 'Conscionable Agreement',
          description: 'Agreement must not be unconscionable',
          required: true
        }
      ],
      disclosureRequirements: [
        'All assets and their values',
        'All debts and liabilities',
        'Income and earning capacity',
        'Any expected inheritances or gifts'
      ],
      notarizationRequired: false,
      witnessRequired: false,
      specialRules: [
        'Emphasizes voluntariness and full disclosure',
        'Court will examine unconscionability',
        'Cannot adversely affect child support obligations'
      ]
    }
  };

  getStateRequirements(state: USState): StateCompliance {
    return this.stateCompliances[state];
  }

  getAllStates(): StateCompliance[] {
    return Object.values(this.stateCompliances);
  }

  validateStateCompliance(state: USState, agreementData: any): { valid: boolean; violations: string[] } {
    const compliance = this.getStateRequirements(state);
    const violations: string[] = [];

    // Check required elements
    compliance.requirements.forEach(req => {
      if (req.required) {
        // Add specific validation logic based on requirement
        switch (req.name) {
          case 'Seven-Day Waiting Period':
            if (state === 'CALIFORNIA' && agreementData.executionDate && agreementData.marriageDate) {
              const daysDiff = Math.floor(
                (new Date(agreementData.marriageDate).getTime() - new Date(agreementData.executionDate).getTime()) 
                / (1000 * 60 * 60 * 24)
              );
              if (daysDiff < 7) {
                violations.push('California requires at least 7 days between agreement execution and marriage');
              }
            }
            break;
          case 'Acknowledgment or Notarization':
            if (state === 'NEW_YORK' && !agreementData.notarized) {
              violations.push('New York requires the agreement to be notarized or acknowledged');
            }
            break;
        }
      }
    });

    return {
      valid: violations.length === 0,
      violations
    };
  }

  getRequiredSteps(state: USState): string[] {
    const compliance = this.getStateRequirements(state);
    const steps = [
      'Basic Information',
      'Asset Disclosure',
      'Debt Disclosure',
      'Income Information',
      'Agreement Terms',
      'Review & Preview'
    ];

    if (compliance.notarizationRequired) {
      steps.push('Notarization');
    }

    steps.push('Signatures');

    return steps;
  }
}