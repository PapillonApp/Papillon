export function getLabelsFromTitle(title: string): string[] {
  const labels: string[] = [];
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.startsWith('[bug]')) {
    labels.push('type: bug');
  } else if (lowerTitle.startsWith('[feature]')) {
    labels.push('type: enhancement');
  }

  return labels;
}
