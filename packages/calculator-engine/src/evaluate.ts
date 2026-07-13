import {
  Calculator,
  CalculatorBlock,
  CostField,
  CalculationResult,
  CalculationResultBreakdown,
  CostCategory
} from '@calcoster/types';

/**
 * Evaluates a single block (either a Field or a Group) against current input quantities and field definitions.
 * Updates the running total based on the block's operator.
 */
export function evaluateBlock(
  block: CalculatorBlock,
  fieldsMap: Record<string, CostField>,
  inputs: Record<string, number>, // fieldId -> quantity/value input
  runningTotal: number,
  outputs: Record<string, number>, // fieldId -> calculated amount (accumulated outputs)
  breakdown: Record<CostCategory, number>
): { val: number; newRunningTotal: number } {
  let val = 0;
  const op = block.operatorBefore || '+';

  if (block.type === 'field') {
    const field = fieldsMap[block.fieldId];
    if (field) {
      const rate = block.valueOverride !== undefined ? block.valueOverride : field.defaultValue;
      const qty = inputs[field.id] !== undefined ? inputs[field.id] : 1; // Default quantity is 1 if not provided

      if (field.category === 'Tax' || field.category === 'Profit') {
        // Percentage based fields calculate based on the current running total
        const percentage = qty !== undefined ? qty : rate; // Use user entered percentage if available, otherwise default rate
        val = (percentage / 100) * runningTotal;
      } else {
        // Standard fields calculate as rate * quantity
        val = rate * qty;
      }

      // Record output value for this field
      outputs[field.id] = val;

      // Accumulate into category breakdown
      const cat = field.category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + val;
    }
  } else if (block.type === 'group') {
    // Nested group calculation (acts like brackets)
    let groupTotal = 0;
    const groupOutputs: Record<string, number> = {};
    const groupBreakdown = {} as Record<CostCategory, number>;

    for (const subBlock of block.blocks) {
      const res = evaluateBlock(subBlock, fieldsMap, inputs, groupTotal, groupOutputs, groupBreakdown);
      groupTotal = res.newRunningTotal;
      // Merge outputs
      Object.assign(outputs, groupOutputs);
      // Merge breakdown
      for (const cat in groupBreakdown) {
        const c = cat as CostCategory;
        breakdown[c] = (breakdown[c] || 0) + (groupBreakdown[c] || 0);
      }
    }

    val = groupTotal;
  }

  // Apply operator to the running total
  let newRunningTotal = runningTotal;
  switch (op) {
    case '+':
      newRunningTotal += val;
      break;
    case '-':
      newRunningTotal -= val;
      break;
    case '*':
      newRunningTotal *= val;
      break;
    case '/':
      newRunningTotal = val !== 0 ? newRunningTotal / val : 0;
      break;
    case '=':
      // Assigns the block value as the new total
      newRunningTotal = val;
      break;
    default:
      newRunningTotal += val;
  }

  return { val, newRunningTotal };
}

/**
 * Main evaluation entry point.
 * Given a Calculator definition, user inputs, and available Cost Fields,
 * it returns the detailed calculation results and category breakdowns.
 */
export function calculate(
  calculator: Calculator,
  inputs: Record<string, number>,
  fields: CostField[]
): CalculationResult {
  const fieldsMap = fields.reduce((acc, f) => {
    acc[f.id] = f;
    return acc;
  }, {} as Record<string, CostField>);

  let runningTotal = 0;
  const outputs: Record<string, number> = {};
  const breakdownAccumulator = {
    Material: 0,
    Labour: 0,
    Machine: 0,
    Process: 0,
    Other: 0,
    Tax: 0,
    Profit: 0
  } as Record<CostCategory, number>;

  for (const block of calculator.blocks) {
    const res = evaluateBlock(block, fieldsMap, inputs, runningTotal, outputs, breakdownAccumulator);
    runningTotal = res.newRunningTotal;
  }

  // Convert breakdown accumulator to final output breakdown items
  const totalCost = runningTotal;
  const breakdown: CalculationResultBreakdown[] = Object.entries(breakdownAccumulator)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as CostCategory,
      label: `${category} Cost`,
      amount,
      percentageOfTotal: totalCost > 0 ? (amount / totalCost) * 100 : 0
    }));

  return {
    calculatorId: calculator.id,
    inputs,
    outputs,
    totalCost,
    breakdown,
    timestamp: new Date().toISOString()
  };
}

/**
 * Returns a human-readable list of changes between two calculator versions.
 */
export function diffCalculators(
  oldBlocks: CalculatorBlock[],
  newBlocks: CalculatorBlock[]
): Array<{ fieldLabel: string; type: 'added' | 'removed' | 'modified'; from?: string; to?: string }> {
  // Simple diff by listing added/removed IDs
  const getFieldIds = (blocks: CalculatorBlock[]): string[] => {
    const ids: string[] = [];
    const traverse = (b: CalculatorBlock) => {
      if (b.type === 'field') {
        ids.push(b.fieldId);
      } else {
        b.blocks.forEach(traverse);
      }
    };
    blocks.forEach(traverse);
    return ids;
  };

  const oldIds = getFieldIds(oldBlocks);
  const newIds = getFieldIds(newBlocks);

  const changes: Array<{ fieldLabel: string; type: 'added' | 'removed' | 'modified'; from?: string; to?: string }> = [];

  newIds.forEach(id => {
    if (!oldIds.includes(id)) {
      changes.push({
        fieldLabel: id, // Fallback to ID, will resolve to label in UI
        type: 'added'
      });
    }
  });

  oldIds.forEach(id => {
    if (!newIds.includes(id)) {
      changes.push({
        fieldLabel: id,
        type: 'removed'
      });
    }
  });

  return changes;
}
