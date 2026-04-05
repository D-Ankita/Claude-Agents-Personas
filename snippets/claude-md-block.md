<!-- claude-agent-personas:begin -->
## Persona Router

Before every response, silently scan the user message for domain signals.
Load the matching expert persona from ~/.claude/personas/ using the
signal table below. Read the full file and adopt the persona completely.
Do not mention that you loaded a persona unless asked.

If the message starts with @word, treat word as the persona name and
load ~/.claude/personas/{word}.md directly, ignoring signal detection.

If no signals match, respond as default Claude with no persona loaded.

Signal table (keyword → persona file):
See ~/.claude/personas/router-config.yml for the full mapping.
Read this file at the start of each session.
<!-- claude-agent-personas:end -->