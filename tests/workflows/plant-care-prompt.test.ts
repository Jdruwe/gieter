import { it, expect } from "vitest"
import { plantCareSchema } from "@/domain/plant-care"

it("accepts a well-formed plan", () => {
  expect(() =>
    plantCareSchema.parse({
      name: "Roos",
      type: "bloem",
      sources: ["https://example.com"],
      tasks: [
        {
          description: "Snoeien",
          deadline: { month: 3, day: 15 },
          products: ["snoeischaar"],
        },
      ],
    })
  ).not.toThrow()
})

it("rejects a task missing a deadline", () => {
  expect(() =>
    plantCareSchema.parse({
      name: "Roos",
      type: "bloem",
      sources: [],
      tasks: [{ description: "Snoeien", products: [] }],
    })
  ).toThrow()
})

it("rejects a task with a non-numeric deadline month", () => {
  expect(() =>
    plantCareSchema.parse({
      name: "Roos",
      type: "bloem",
      sources: [],
      tasks: [
        {
          description: "Snoeien",
          deadline: { month: "maart", day: 15 },
          products: [],
        },
      ],
    })
  ).toThrow()
})
