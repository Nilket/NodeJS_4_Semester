import vm from 'vm';

/*  WARNING!!!
    This is a teaching demo. It is NOT ready for production.

    Security issues:
    - The blacklist is naive and easily bypassed (e.g. 'pro'+'cess', unicode, or this.constructor.constructor('return process')())
    - Node's vm module is NOT a security sandbox (see Node.js docs)
    - No memory limits on code execution
    - No rate-limiting
    - Sessions are never cleaned up (memory leak)
    - No input size validation
*/

const sessions = new Map();

const BLACKLIST = [
  'process', 'require', 'import', 'global', 'globalThis', 'this',
  '__proto__', 'constructor', 'prototype',
  'eval', 'Function', 'Reflect', 'Proxy',
  'module', 'exports', 'Buffer', 'fetch',
  'setTimeout', 'setInterval', 'setImmediate'
];

function containsBlacklistedTerm(code) {
  const found = BLACKLIST.find(term => code.includes(term));
  return found || null;
}

export function getOrCreateSandboxContext(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, createSandboxContext(sessionId));
  }
  return sessions.get(sessionId);
}

function createSandboxContext(sessionId) {
  const sandbox = {
    output: '',
    error: '',
    result: null,
    Math,
    Date,
    JSON,
    parseInt,
    parseFloat
  };

  sandbox.console = {
    log: (...args) => { sandbox.output += args.map(String).join(' ') + '\n'; },
    error: (...args) => { sandbox.error += args.map(String).join(' ') + '\n'; }
  };

  return {
    context: vm.createContext(sandbox)
  };
}

export function executeCodeInSandbox(sandbox, code) {
  const blocked = containsBlacklistedTerm(code);
  if (blocked) {
    return {
      success: false,
      error: `'${blocked}' is not allowed`
    };
  }

  sandbox.context.output = '';
  sandbox.context.error = '';

  try {
    const script = new vm.Script(code);
    const result = script.runInContext(sandbox.context, {
      timeout: 2000,
      displayErrors: false
    });
    
    sandbox.context.result = result;

    return {
        success: true,
        output: sandbox.context.output.trim(),
        result: result === undefined ? 'undefined' : String(result)
    };

  } catch (error) {
    return {
        success: false,
        error: error.message
    };

  }
}
