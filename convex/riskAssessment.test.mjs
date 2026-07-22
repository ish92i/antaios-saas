import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { classifyCountryRisk } from "./lib/countryRisk.ts"

describe("classifyCountryRisk — EC EUDR country benchmarking", () => {
  it("classifies high-risk countries correctly", () => {
    assert.equal(classifyCountryRisk("RU"), "high", "Russia should be high risk")
    assert.equal(classifyCountryRisk("BY"), "high", "Belarus should be high risk")
    assert.equal(classifyCountryRisk("KP"), "high", "North Korea should be high risk")
    assert.equal(classifyCountryRisk("MM"), "high", "Myanmar should be high risk")
  })

  it("classifies standard-risk countries correctly", () => {
    assert.equal(classifyCountryRisk("BR"), "standard", "Brazil should be standard risk")
    assert.equal(classifyCountryRisk("ID"), "standard", "Indonesia should be standard risk")
    assert.equal(classifyCountryRisk("MY"), "standard", "Malaysia should be standard risk")
    assert.equal(classifyCountryRisk("CI"), "standard", "Côte d'Ivoire should be standard risk")
    assert.equal(classifyCountryRisk("CO"), "standard", "Colombia should be standard risk")
    assert.equal(classifyCountryRisk("NG"), "standard", "Nigeria should be standard risk")
  })

  it("classifies low-risk countries correctly (including previously uncovered)", () => {
    assert.equal(classifyCountryRisk("IS"), "low", "Iceland should be low risk (was not in old map)")
    assert.equal(classifyCountryRisk("FR"), "low", "France should be low risk")
    assert.equal(classifyCountryRisk("DE"), "low", "Germany should be low risk")
    assert.equal(classifyCountryRisk("JP"), "low", "Japan should be low risk")
    assert.equal(classifyCountryRisk("AU"), "low", "Australia should be low risk")
    assert.equal(classifyCountryRisk("CA"), "low", "Canada should be low risk")
  })

  it("returns null for missing or empty country code", () => {
    assert.equal(classifyCountryRisk(undefined), null, "undefined should return null")
    assert.equal(classifyCountryRisk(""), null, "empty string should return null")
  })

  it("handles case insensitivity and whitespace", () => {
    assert.equal(classifyCountryRisk("ru"), "high", "lowercase 'ru' should be high risk")
    assert.equal(classifyCountryRisk("  BR  "), "standard", "whitespace-padded 'BR' should be standard risk")
    assert.equal(classifyCountryRisk("fr"), "low", "lowercase 'fr' should be low risk")
  })

  it("returns null for unrecognized ISO codes (not silently low)", () => {
    assert.equal(classifyCountryRisk("ZZ"), null, "unrecognized code 'ZZ' should return null")
    assert.equal(classifyCountryRisk("XX"), null, "unrecognized code 'XX' should return null")
  })
})
