import {BinaryHeap} from './heap.js';

function solveData(data) {

    // convert data to internal format
    converData(data);
    const sz = data['nodes'].length;
    const vals = Array(sz).fill(0);

    // Calculating net balance of each person
    for (let i = 0; i < data['edges'].length; i++) {
        const edge = data['edges'][i];
        let amount = +parseFloat(edge['label']);
        vals[edge['to'] - 1] += amount;
        vals[edge['from'] - 1] -= amount;
    }

    const new_vals = {}
    for (let i = 0; i < data['nodes'].length; i++) {
        new_vals[data['nodes'][i]] = vals[i];
    }

    const pos_heap = new BinaryHeap();
    const neg_heap = new BinaryHeap();

    for (let i = 0; i < sz; i++) {
        if (vals[i] > 0) {
            pos_heap.insert([vals[i], i]);
        } else {
            neg_heap.insert(([-vals[i], i]));
            vals[i] *= -1;
        }
    }

    const new_edges = [];
    while (!pos_heap.empty() && !neg_heap.empty()) {
        const mx = pos_heap.extractMax();
        const mn = neg_heap.extractMax();

        const amt = Math.min(mx[0], mn[0]);
        const to = mx[1];
        const from = mn[1];
        
        new_edges.push({ from: from + 1, to: to + 1, label: String(Math.abs(amt)) });
        vals[to] -= amt;
        vals[from] -= amt;

        if (mx[0] > mn[0]) {
            pos_heap.insert([vals[to], to]);
        } else if (mx[0] < mn[0]) {
            neg_heap.insert([vals[from], from]);
        }
    }
    data.edges = new_edges;

    // convert back to original data format
    for (let i = 0; i < data['edges'].length; i++) {
        data['edges'][i]['from'] = data['nodes'][[data['edges'][i]['from'] - 1]];
        data['edges'][i]['to'] = data['nodes'][[data['edges'][i]['to'] - 1]];
    }

    return {
        edges: new_edges,
        vals: new_vals,
    };
}

function converData(data){

    const uidMap = new Map();
    for (let i = 0; i < data['nodes'].length; i++) {
        uidMap.set(data['nodes'][i], i + 1);
    }
    for (let i = 0; i < data['edges'].length; i++) {
        data['edges'][i]['from'] = uidMap.get(data['edges'][i]['from']);
        data['edges'][i]['to'] =  uidMap.get(data['edges'][i]['to']);
    }
    return;
}

// const labelMap = {
//     12: 'A',
//     212: 'B',
//     322: 'C',
//     421: 'D'
// }

// let d = {
//     nodes: [12, 212, 322, 421],
//     edges: [
//         { from: 12, to: 212, label: '10.1213123' },
//         { from: 212, to: 322, label: '20.23123' },
//         { from: 322, to: 421, label: '30.223' },
//         { from: 421, to: 12, label: '40.2123' },
//     ]
// };

// let ans = solveData(d);

// for(let i=0;i<ans['edges'].length;i++){
//     let edge = ans['edges'][i];
//     let from =  edge['from'];
//     let to = edge['to'];

//     console.log( labelMap[from] + ' owes ' + labelMap[to] + ' ' + edge['label'])
// }

// const c = solveData(d);

// console.log(c);

export {solveData};