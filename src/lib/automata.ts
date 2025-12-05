// Types for automata
export interface State {
  id: string;
  isStart: boolean;
  isAccept: boolean;
}

export interface Transition {
  from: string;
  to: string;
  symbol: string; // 'λ' or 'ε' for epsilon transitions
}

export interface Automaton {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
}

// Parse regex to NFA-λ using Thompson's construction
export function regexToNFALambda(regex: string): Automaton {
  let stateCounter = 0;
  const newState = (isStart = false, isAccept = false): State => ({
    id: `q${stateCounter++}`,
    isStart,
    isAccept,
  });

  interface NFAFragment {
    start: State;
    accept: State;
    states: State[];
    transitions: Transition[];
  }

  const createBasicNFA = (symbol: string): NFAFragment => {
    const start = newState(true, false);
    const accept = newState(false, true);
    return {
      start,
      accept,
      states: [start, accept],
      transitions: [{ from: start.id, to: accept.id, symbol }],
    };
  };

  const concatenate = (nfa1: NFAFragment, nfa2: NFAFragment): NFAFragment => {
    nfa1.accept.isAccept = false;
    nfa2.start.isStart = false;
    return {
      start: nfa1.start,
      accept: nfa2.accept,
      states: [...nfa1.states, ...nfa2.states],
      transitions: [
        ...nfa1.transitions,
        ...nfa2.transitions,
        { from: nfa1.accept.id, to: nfa2.start.id, symbol: 'λ' },
      ],
    };
  };

  const union = (nfa1: NFAFragment, nfa2: NFAFragment): NFAFragment => {
    const start = newState(true, false);
    const accept = newState(false, true);
    nfa1.start.isStart = false;
    nfa2.start.isStart = false;
    nfa1.accept.isAccept = false;
    nfa2.accept.isAccept = false;
    return {
      start,
      accept,
      states: [start, ...nfa1.states, ...nfa2.states, accept],
      transitions: [
        ...nfa1.transitions,
        ...nfa2.transitions,
        { from: start.id, to: nfa1.start.id, symbol: 'λ' },
        { from: start.id, to: nfa2.start.id, symbol: 'λ' },
        { from: nfa1.accept.id, to: accept.id, symbol: 'λ' },
        { from: nfa2.accept.id, to: accept.id, symbol: 'λ' },
      ],
    };
  };

  const kleeneStar = (nfa: NFAFragment): NFAFragment => {
    const start = newState(true, false);
    const accept = newState(false, true);
    nfa.start.isStart = false;
    nfa.accept.isAccept = false;
    return {
      start,
      accept,
      states: [start, ...nfa.states, accept],
      transitions: [
        ...nfa.transitions,
        { from: start.id, to: nfa.start.id, symbol: 'λ' },
        { from: start.id, to: accept.id, symbol: 'λ' },
        { from: nfa.accept.id, to: nfa.start.id, symbol: 'λ' },
        { from: nfa.accept.id, to: accept.id, symbol: 'λ' },
      ],
    };
  };

  const kleenePlus = (nfa: NFAFragment): NFAFragment => {
    const start = newState(true, false);
    const accept = newState(false, true);
    nfa.start.isStart = false;
    nfa.accept.isAccept = false;
    return {
      start,
      accept,
      states: [start, ...nfa.states, accept],
      transitions: [
        ...nfa.transitions,
        { from: start.id, to: nfa.start.id, symbol: 'λ' },
        { from: nfa.accept.id, to: nfa.start.id, symbol: 'λ' },
        { from: nfa.accept.id, to: accept.id, symbol: 'λ' },
      ],
    };
  };

  const optional = (nfa: NFAFragment): NFAFragment => {
    const start = newState(true, false);
    const accept = newState(false, true);
    nfa.start.isStart = false;
    nfa.accept.isAccept = false;
    return {
      start,
      accept,
      states: [start, ...nfa.states, accept],
      transitions: [
        ...nfa.transitions,
        { from: start.id, to: nfa.start.id, symbol: 'λ' },
        { from: start.id, to: accept.id, symbol: 'λ' },
        { from: nfa.accept.id, to: accept.id, symbol: 'λ' },
      ],
    };
  };

  // Simple regex parser
  const parse = (expr: string): NFAFragment => {
    if (expr.length === 0) {
      return createBasicNFA('λ');
    }

    const tokens: (string | NFAFragment)[] = [];
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      if (char === '(') {
        let depth = 1;
        let j = i + 1;
        while (j < expr.length && depth > 0) {
          if (expr[j] === '(') depth++;
          if (expr[j] === ')') depth--;
          j++;
        }
        const subExpr = expr.slice(i + 1, j - 1);
        tokens.push(parse(subExpr));
        i = j;
      } else if (char === '*' && tokens.length > 0) {
        const last = tokens.pop()!;
        tokens.push(typeof last === 'string' ? kleeneStar(createBasicNFA(last)) : kleeneStar(last));
        i++;
      } else if (char === '+' && tokens.length > 0) {
        const last = tokens.pop()!;
        tokens.push(typeof last === 'string' ? kleenePlus(createBasicNFA(last)) : kleenePlus(last));
        i++;
      } else if (char === '?' && tokens.length > 0) {
        const last = tokens.pop()!;
        tokens.push(typeof last === 'string' ? optional(createBasicNFA(last)) : optional(last));
        i++;
      } else if (char === '|') {
        // Handle union - parse left side first
        const left = tokens.reduce<NFAFragment | null>((acc, t) => {
          const frag = typeof t === 'string' ? createBasicNFA(t) : t;
          return acc ? concatenate(acc, frag) : frag;
        }, null);
        tokens.length = 0;
        
        const right = parse(expr.slice(i + 1));
        return left ? union(left, right) : right;
      } else if (char !== ' ') {
        tokens.push(char);
        i++;
      } else {
        i++;
      }
    }

    // Concatenate all tokens
    return tokens.reduce<NFAFragment | null>((acc, t) => {
      const frag = typeof t === 'string' ? createBasicNFA(t) : t;
      return acc ? concatenate(acc, frag) : frag;
    }, null) || createBasicNFA('λ');
  };

  const result = parse(regex);
  const alphabet = [...new Set(result.transitions.map(t => t.symbol).filter(s => s !== 'λ'))];

  return {
    states: result.states,
    transitions: result.transitions,
    alphabet,
  };
}

// Epsilon closure computation
function epsilonClosure(states: Set<string>, transitions: Transition[]): Set<string> {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const state = stack.pop()!;
    transitions
      .filter(t => t.from === state && t.symbol === 'λ')
      .forEach(t => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }

  return closure;
}

// Convert NFA-λ to NFA (remove epsilon transitions)
export function nfaLambdaToNFA(nfaLambda: Automaton): Automaton {
  const { states, transitions, alphabet } = nfaLambda;
  const newTransitions: Transition[] = [];

  states.forEach(state => {
    const closure = epsilonClosure(new Set([state.id]), transitions);
    
    alphabet.forEach(symbol => {
      const reachable = new Set<string>();
      
      closure.forEach(s => {
        transitions
          .filter(t => t.from === s && t.symbol === symbol)
          .forEach(t => {
            epsilonClosure(new Set([t.to]), transitions).forEach(r => reachable.add(r));
          });
      });

      reachable.forEach(r => {
        if (!newTransitions.some(t => t.from === state.id && t.to === r && t.symbol === symbol)) {
          newTransitions.push({ from: state.id, to: r, symbol });
        }
      });
    });
  });

  // Update accept states based on epsilon closure
  const newStates = states.map(s => {
    const closure = epsilonClosure(new Set([s.id]), transitions);
    const hasAcceptInClosure = [...closure].some(id => 
      states.find(st => st.id === id)?.isAccept
    );
    return { ...s, isAccept: s.isAccept || hasAcceptInClosure };
  });

  return {
    states: newStates,
    transitions: newTransitions,
    alphabet,
  };
}

// Convert NFA to DFA using subset construction
export function nfaToDFA(nfa: Automaton): Automaton {
  const { states, transitions, alphabet } = nfa;
  
  const startState = states.find(s => s.isStart);
  if (!startState) {
    return { states: [], transitions: [], alphabet };
  }

  const dfaStates: Map<string, State> = new Map();
  const dfaTransitions: Transition[] = [];
  const queue: Set<string>[] = [];
  
  const startSet = new Set([startState.id]);
  const startSetKey = [...startSet].sort().join(',');
  
  dfaStates.set(startSetKey, {
    id: startSetKey || '∅',
    isStart: true,
    isAccept: states.some(s => startSet.has(s.id) && s.isAccept),
  });
  
  queue.push(startSet);

  while (queue.length > 0) {
    const currentSet = queue.shift()!;
    const currentKey = [...currentSet].sort().join(',') || '∅';

    alphabet.forEach(symbol => {
      const nextSet = new Set<string>();
      
      currentSet.forEach(stateId => {
        transitions
          .filter(t => t.from === stateId && t.symbol === symbol)
          .forEach(t => nextSet.add(t.to));
      });

      const nextKey = [...nextSet].sort().join(',') || '∅';
      
      if (!dfaStates.has(nextKey) && nextSet.size > 0) {
        dfaStates.set(nextKey, {
          id: nextKey,
          isStart: false,
          isAccept: states.some(s => nextSet.has(s.id) && s.isAccept),
        });
        queue.push(nextSet);
      }

      if (nextSet.size > 0) {
        dfaTransitions.push({ from: currentKey, to: nextKey, symbol });
      }
    });
  }

  // Rename states to simpler names
  const stateMapping = new Map<string, string>();
  let counter = 0;
  dfaStates.forEach((state, key) => {
    stateMapping.set(key, `q${counter++}`);
  });

  const renamedStates = [...dfaStates.values()].map(s => ({
    ...s,
    id: stateMapping.get(s.id) || s.id,
  }));

  const renamedTransitions = dfaTransitions.map(t => ({
    ...t,
    from: stateMapping.get(t.from) || t.from,
    to: stateMapping.get(t.to) || t.to,
  }));

  return {
    states: renamedStates,
    transitions: renamedTransitions,
    alphabet,
  };
}

// Validate if a string is accepted by a DFA
export function validateString(dfa: Automaton, input: string): boolean {
  const startState = dfa.states.find(s => s.isStart);
  if (!startState) return false;

  let currentState = startState.id;

  for (const symbol of input) {
    const transition = dfa.transitions.find(
      t => t.from === currentState && t.symbol === symbol
    );
    if (!transition) return false;
    currentState = transition.to;
  }

  const finalState = dfa.states.find(s => s.id === currentState);
  return finalState?.isAccept ?? false;
}

// Parse edge list to NFA-λ
export function parseEdgeList(input: string): Automaton {
  const lines = input.trim().split('\n').filter(l => l.trim());
  const states: Map<string, State> = new Map();
  const transitions: Transition[] = [];
  const alphabet = new Set<string>();

  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s*,\s*|\s+/);
    if (parts.length >= 3) {
      const [from, symbol, to] = parts;
      
      if (!states.has(from)) {
        states.set(from, { id: from, isStart: index === 0 && !states.has(from), isAccept: false });
      }
      if (!states.has(to)) {
        states.set(to, { id: to, isStart: false, isAccept: false });
      }

      transitions.push({ from, to, symbol: symbol === 'e' || symbol === 'ε' ? 'λ' : symbol });
      
      if (symbol !== 'λ' && symbol !== 'e' && symbol !== 'ε') {
        alphabet.add(symbol);
      }
    }
  });

  // Mark first state as start
  const stateArray = [...states.values()];
  if (stateArray.length > 0) {
    stateArray[0].isStart = true;
  }

  // Mark states mentioned with * or F as accept (or last state by default)
  lines.forEach(line => {
    const match = line.match(/accept:\s*(.+)/i) || line.match(/final:\s*(.+)/i);
    if (match) {
      match[1].split(/\s*,\s*/).forEach(s => {
        const state = states.get(s.trim());
        if (state) state.isAccept = true;
      });
    }
  });

  // If no accept states defined, mark last referenced state
  if (!stateArray.some(s => s.isAccept) && stateArray.length > 0) {
    stateArray[stateArray.length - 1].isAccept = true;
  }

  return {
    states: stateArray,
    transitions,
    alphabet: [...alphabet],
  };
}
