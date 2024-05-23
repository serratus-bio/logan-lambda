import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const FASTA = args => ({
  flush:async function() {
    if(this.queue) {
      const queue = this.queue;

      delete this.queue;

      await args.onSequence(queue.join('\n'));
    }
  },
  queue:undefined,
  push:async function(line) {
    if(line.startsWith('>'))
      await this.flush();
    
    if(!this.queue)
      this.queue = [];

    this.queue.push(line);
  }
});

export const handler = async event => {
  let handler = undefined;

  if(event.headers?.authorization !== 'Bearer 20240522')
    return { statusCode:401 };

  let body = undefined;

  switch(event.requestContext.http.method) {
    case 'GET':
      const path = event.requestContext.http.path.split(/\//);

      if(path.length === 3)
        body = { SRA:path[1], contig:[path[2]] };
      break;
    case 'POST':
      try { body = JSON.parse(event.body); } catch {}
      break;
  }

  if(!body || !body.SRA || !body.contig)
    return { statusCode:400 };

  const fasta = FASTA({ onSequence:sequence => {
    if(body.contig.includes(sequence.match(/^>(.+?)\s/)[1])) {
      if(!handler)
        handler = [];
        
      handler.push(sequence);
    }
  } });

  for await (const line of createInterface({
    input:spawn('sh', ['-c', 'curl https://logan-pub.s3.amazonaws.com/c/' + body.SRA + '/' + body.SRA + '.contigs.fa.zst | bin/zstd']).stdout,
    terminal:false
  }))
    await fasta.push(line);
  
  await fasta.flush();
  
  return {
    ...handler && { body:handler.join('\n') + '\n' },
    statusCode:200
  };
};
