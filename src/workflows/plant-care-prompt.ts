type ExtractionResult = {
  title: string | null
  url: string
  rawContent: string
}

export function buildPlantCarePrompt(
  plantName: string,
  extractionResults: ExtractionResult[]
): { system: string; prompt: string } {
  const system = `
- Only use the <extraction-results> as a source of truth, do NOT generate something of your own
- Generate output in Dutch, even if the input is in another language.
- Avoid using vague references like 'in three months' or 'late autumn.' Always calculate and state the exact deadline or scheduled date for a task to ensure maintenance logs remain actionable and unambiguous.
- Sort maintenance tasks by date ascending
- Providing enough details when pruning info is shared
`

  const prompt = `
<task-context>
  You are a helpful plant assistant that creates a maintenance plan requested by the user.
</task-context>

<background-data>
  <extraction-results>
    ${extractionResults
      .map(
        (result) => `
    <result>
      <title>${result.title}</title>
      <url>${result.url}</url>
      <content>${result.rawContent}</content>
    </result>`
      )
      .join("\n")}
  </extraction-results>
</background-data>

<the-ask>
  The user request a plan to be made for: <plant>${plantName}</plant>
</the-ask>
`

  return { system, prompt }
}
