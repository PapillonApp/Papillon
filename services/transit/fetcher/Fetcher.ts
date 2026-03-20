export class Fetcher {
  public async get<T>(url: string, options: RequestInit = {
    method: 'GET',
  }): Promise<T> {
    const f = await fetch(url, options);
    if (!f.ok) {
      const text = await f.text();
      throw new Error(text);
    }
    const j = await f.json();
    return j as T;
  }
}