import { Response } from 'express';

interface Client {
  id: string;
  res: Response;
}

class SSEManager {
  private clients: Client[] = [];

  addClient(res: Response): string {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // For Nginx proxy buffering
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId: id })}\n\n`);

    const client: Client = { id, res };
    this.clients.push(client);

    return id;
  }

  removeClient(id: string) {
    this.clients = this.clients.filter(c => c.id !== id);
  }

  broadcast(eventType: string, data: any) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.res.write(payload);
      } catch (err) {
        // client disconnected
      }
    }
  }
}

export const sseManager = new SSEManager();
