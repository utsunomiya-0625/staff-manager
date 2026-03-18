export async function sendSlackNotification(
  webhookUrl: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function formatMissingReportMessage(names: string[], date: string): string {
  return [
    `:warning: *日報未提出アラート* (${date})`,
    "",
    `以下のスタッフが日報を未提出です:`,
    ...names.map((n) => `• ${n}`),
    "",
    `_Staff Manager から自動送信_`,
  ].join("\n");
}
