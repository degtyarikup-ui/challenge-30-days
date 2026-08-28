class SSEManager {
    clients = [];
    addClient(res) {
        const id = Math.random().toString(36).substring(2, 9);
        // Setup SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // For Nginx proxy buffering
        });
        res.write(`data: ${JSON.stringify({ type: 'connected', clientId: id })}\n\n`);
        const client = { id, res };
        this.clients.push(client);
        return id;
    }
    removeClient(id) {
        this.clients = this.clients.filter(c => c.id !== id);
    }
    broadcast(eventType, data) {
        const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of this.clients) {
            try {
                client.res.write(payload);
            }
            catch (err) {
                // client disconnected
            }
        }
    }
}
export const sseManager = new SSEManager();
