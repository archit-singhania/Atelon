import test from 'node:test';
import assert from 'node:assert/strict';
import { readCompletionStream } from '../apps/api/src/providers.js';
function response(chunks){const encoder=new TextEncoder();return new Response(new ReadableStream({start(controller){chunks.forEach(chunk=>controller.enqueue(encoder.encode(chunk)));controller.close();}}),{headers:{'content-type':'text/event-stream'}});}
test('native streaming handles split frames, CRLF and finish markers',async()=>{const answer=await readCompletionStream(response(['data: {"choices":[{"delta":{"content":"Sourced "}}]}\r','\n\r\ndata: {"choices":[{"delta":{"content":"answer."},"finish_reason":"stop"}]}\r\n\r\n','data: [DONE]\r\n\r\n']));assert.equal(answer,'Sourced answer.');});
test('native streaming rejects truncated, malformed and oversized responses',async()=>{await assert.rejects(()=>readCompletionStream(response(['data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'])),/incomplete/);await assert.rejects(()=>readCompletionStream(response(['data: invalid\n\n'])));await assert.rejects(()=>readCompletionStream(response(['x'.repeat(65537)])),/too large/);});
