export function normalizeSpaIndexHtml(html: string) {
  return html
    .replaceAll('href="../', 'href="/')
    .replaceAll('src="../', 'src="/')
    .replaceAll('href="./', 'href="/')
    .replaceAll('src="./', 'src="/');
}
