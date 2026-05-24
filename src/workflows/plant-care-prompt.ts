// todo: specify interface at this level? Also look into https://www.youtube.com/watch?v=e0AIkYrXAYE
interface ReferenceSource {
  title: string | null;
  url: string;
  content: string;
}

function buildPlantCarePrompt(
  plantName: string,
  sources: ReferenceSource[]
): { system: string; prompt: string } {
  const system = `
- Only use the <reference-sources> as a source of truth, do NOT generate something of your own
- Generate output in Dutch, even if the input is in another language.
- Avoid using vague references like 'in three months' or 'late autumn.' Always calculate and state the exact deadline or scheduled date for a task to ensure maintenance logs remain actionable and unambiguous.
- Sort maintenance tasks by date ascending
- Providing enough details when pruning info is shared
`;

  const prompt = `
<task-context>
  You are a helpful plant assistant that creates a maintenance plan requested by the user.
</task-context>

<background-data>
  <reference-sources>
    ${sources
      .map(
        (source) => `
    <result>
      <!--todo: render optionally?-->
      <title>${source.title}</title>
      <url>${source.url}</url>
      <content>${source.content}</content>
    </result>`
      )
      .join("\n")}
  </reference-sources>
</background-data>

<the-ask>
  The user request a plan to be made for: <plant>${plantName}</plant>
</the-ask>
`;

  return { system, prompt };
}

export { type ReferenceSource, buildPlantCarePrompt };
