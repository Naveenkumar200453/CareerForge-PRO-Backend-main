export const extractKeywordsPrompt = (jd) => `
You are an ATS keyword extraction engine.

From the following Job Description, extract:
- Skills
- Tools
- Technologies
- Soft skills

Return ONLY a comma-separated list.

Job Description:
${jd}
`

export const rewriteBulletPrompt = ({
  bullet,
  keywords,
  role,
}) => `
You are an expert resume writer.

Rewrite the following resume bullet point so that:
- It sounds authoritative and impact-driven
- It naturally includes these keywords: ${keywords}
- It is suitable for the role: ${role}
- It is ATS-friendly
- Keep it under 30 words

Original Bullet:
${bullet}
`

export const rewriteSummaryPrompt = ({
  summary,
  keywords,
  role,
}) => `
You are an expert resume writer.

Rewrite the following professional summary so that:
- It is optimized for ATS
- It includes these keywords: ${keywords}
- It is tailored for the role: ${role}
- Max 3 sentences

Original Summary:
${summary}
`
