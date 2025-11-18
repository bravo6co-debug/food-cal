import { RecipeIngredient, SupplierProduct } from "@prisma/client"

export interface IngredientCost {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
  bestPrice: number
  totalCost: number
  supplier?: {
    id: string
    name: string
    productName: string
  }
}

export interface RecipeCostBreakdown {
  recipeName: string
  totalCost: number
  costPerServing: number
  ingredients: IngredientCost[]
}

/**
 * Convert units for cost calculation
 * Simple conversion for common units
 */
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const normalizedFrom = fromUnit.toLowerCase()
  const normalizedTo = toUnit.toLowerCase()

  if (normalizedFrom === normalizedTo) {
    return quantity
  }

  // Weight conversions
  const weightUnits: Record<string, number> = {
    'g': 1,
    'gram': 1,
    'kg': 1000,
    'kilogram': 1000,
    'mg': 0.001,
    'milligram': 0.001,
  }

  // Volume conversions
  const volumeUnits: Record<string, number> = {
    'ml': 1,
    'milliliter': 1,
    'l': 1000,
    'liter': 1000,
  }

  // Try weight conversion
  if (weightUnits[normalizedFrom] && weightUnits[normalizedTo]) {
    return quantity * weightUnits[normalizedFrom] / weightUnits[normalizedTo]
  }

  // Try volume conversion
  if (volumeUnits[normalizedFrom] && volumeUnits[normalizedTo]) {
    return quantity * volumeUnits[normalizedFrom] / volumeUnits[normalizedTo]
  }

  // If no conversion available, return original quantity
  return quantity
}

/**
 * Calculate the best price for an ingredient across suppliers
 */
export function findBestPrice(
  requiredQuantity: number,
  requiredUnit: string,
  products: Array<SupplierProduct & { supplier: { companyName: string } }>
): {
  bestPrice: number
  supplier?: {
    id: string
    name: string
    productName: string
  }
} {
  if (!products || products.length === 0) {
    return { bestPrice: 0 }
  }

  let bestPricePerUnit = Infinity
  let bestSupplier: { id: string; name: string; productName: string } | undefined

  for (const product of products) {
    // Convert product quantity to match required unit
    const convertedQuantity = convertUnit(1, product.unit, requiredUnit)

    if (convertedQuantity > 0) {
      const pricePerUnit = product.price / convertedQuantity

      if (pricePerUnit < bestPricePerUnit) {
        bestPricePerUnit = pricePerUnit
        bestSupplier = {
          id: product.supplierId,
          name: product.supplier.companyName,
          productName: product.productName,
        }
      }
    }
  }

  return {
    bestPrice: bestPricePerUnit === Infinity ? 0 : bestPricePerUnit,
    supplier: bestSupplier,
  }
}

/**
 * Calculate total cost for a recipe
 */
export function calculateRecipeCost(
  recipeName: string,
  servings: number,
  ingredients: Array<RecipeIngredient & {
    ingredient: {
      name: string
      supplierProducts: Array<SupplierProduct & { supplier: { companyName: string } }>
    }
  }>
): RecipeCostBreakdown {
  const ingredientCosts: IngredientCost[] = []
  let totalCost = 0

  for (const recipeIngredient of ingredients) {
    const { bestPrice, supplier } = findBestPrice(
      recipeIngredient.quantity,
      recipeIngredient.unit,
      recipeIngredient.ingredient.supplierProducts
    )

    const ingredientTotalCost = bestPrice * recipeIngredient.quantity

    ingredientCosts.push({
      ingredientId: recipeIngredient.ingredientId,
      ingredientName: recipeIngredient.ingredient.name,
      quantity: recipeIngredient.quantity,
      unit: recipeIngredient.unit,
      bestPrice,
      totalCost: ingredientTotalCost,
      supplier,
    })

    totalCost += ingredientTotalCost
  }

  return {
    recipeName,
    totalCost,
    costPerServing: servings > 0 ? totalCost / servings : totalCost,
    ingredients: ingredientCosts,
  }
}

/**
 * Calculate profit margin
 */
export function calculateMargin(cost: number, salePrice: number): {
  marginAmount: number
  marginPercentage: number
} {
  const marginAmount = salePrice - cost
  const marginPercentage = cost > 0 ? (marginAmount / salePrice) * 100 : 0

  return {
    marginAmount,
    marginPercentage,
  }
}
