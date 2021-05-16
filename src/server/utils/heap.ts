type Heap = HeapNode[]

export interface HeapNode {
  id: number
  score: number
}

export interface HeapFactoryConfig {
  NUM_CHILDREN: number
  comparator: (parent: HeapNode, element: HeapNode) => boolean
  onDiff?: (differences) => void
}

export function heapFactory({
  NUM_CHILDREN = 2,
  comparator = (parent: HeapNode, element: HeapNode): boolean => parent.score > element.score,
  onDiff = (differences) => console.log(differences),
}: HeapFactoryConfig) {

  const parentIndex = (index: number): number => Math.floor((index - 1) / NUM_CHILDREN);
  const nthIndex = (n: number, index: number) => index * NUM_CHILDREN + n
  const leftIndex = (index: number): number => nthIndex(1, index);
  const rightIndex = (index: number): number => nthIndex(2, index);
  const parent = (heap: Heap, node: HeapNode): HeapNode => heap[parentIndex(heap.indexOf(node))];
  const nth = (heap: Heap, node: HeapNode, n: number): HeapNode => heap[nthIndex(n, heap.indexOf(node))];
  const left = (heap: Heap, node: HeapNode): HeapNode => heap[leftIndex(heap.indexOf(node))];
  const right = (heap: Heap, node: HeapNode): HeapNode => heap[rightIndex(heap.indexOf(node))];
  const largest = (heap: Heap): HeapNode => heap.reduce((a: HeapNode, b: HeapNode) => (a.score >= b.score) ? a : b);
  const smallest = (heap: Heap): HeapNode => heap.reduce((a: HeapNode, b: HeapNode) => (a.score < b.score) ? a : b);


  return {
    insert,
    remove,
    parent,
    nth,
    left,
    right,
    largest,
    smallest,
  };


  function remove(heap: Heap, node: HeapNode): Heap {
    const newHeap = heap.slice();
    const index = newHeap.indexOf(node);
    switch (true) {
      case index === -1:
        throw new Error(`Node not in heap`);
      case newHeap.length === 0:
        throw new Error(`heap is empty`);
      case index === newHeap.length - 1:
      case newHeap.length === 1 && index !== 0:
        newHeap.pop();
        break;
      case index === 0:
        _extractRoot(newHeap);
        break;
      default:
        newHeap[index] = newHeap.pop();
        _sinkDown(newHeap, index);
    }
    if (typeof onDiff === 'function') {
      onDiff(_diff(heap, newHeap));
    }
    return newHeap;
  }


  function insert(heap: Heap, node: HeapNode): Heap {
    const newHeap = heap.slice();
    newHeap.push(node);
    _bubbleUp(newHeap);
    if (typeof onDiff === 'function') {
      onDiff(_diff(heap, newHeap));
    }
    return newHeap;
  }


  function _diff(before: Heap, after: Heap) {
    const differences = [];
    // create a map to lookup nodes by id
    const beforeMap = before.reduce((acc, node: HeapNode, i: number) => ({
      ...acc,
      [node.id]: {
        id: node.id,
        score: node.score,
        left: before[leftIndex(i)],
        right: before[rightIndex(i)],
        parent: before[parentIndex(i)],
      },
    }), {});
    const afterMap = after.map((node: HeapNode, i: number) => ({
      id: node.id,
      score: node.score,
      left: after[leftIndex(i)],
      right: after[rightIndex(i)],
      parent: after[parentIndex(i)],
    }));

    for (
      let i = 0;
      i < after.length;
      i++
    ) {
      const afterObj = afterMap[i];
      const beforeObj = beforeMap[afterObj.id];

      // if ((afterObj.parent) && beforeObj?.parent !== afterObj.parent) {
      //   differences.push({
      //     i,
      //     id: afterObj.id,
      //     key: 'parent',
      //     before: beforeObj?.parent?.id,
      //     after: afterObj.parent?.id,
      //   });
      // }
      if ((afterObj.left) && beforeObj?.left !== afterObj.left) {
        differences.push({
          i,
          id: afterObj.id,
          key: 'left',
          before: beforeObj?.left?.id,
          after: afterObj.left?.id,
        });
      }
      if ((afterObj.right) && beforeObj?.right !== afterObj.right) {
        differences.push({
          i,
          id: afterObj.id,
          key: 'right',
          before: beforeObj?.right?.id,
          after: afterObj.right?.id,
        });
      }
    }
    return differences;
  }


  function _extractRoot(heap: Heap): HeapNode {
    if (!heap.length) {
      throw new Error(`heap is empty`);
    }
    const root = heap[0];
    if (heap.length > 1) {
      heap[0] = heap.pop();
      _sinkDown(heap, 0);
      return root;
    }
    heap.shift();
    return root;
  }


  function _bubbleUp(heap, index: number = heap.length - 1): void {
    while (index > 0) {
      const _parentIndex = parentIndex(index);
      switch (true) {
        case _parentIndex >= heap.length:
        case heap[_parentIndex] === heap[index]:
        case _comparator(heap, _parentIndex, index):
          return;
        default:
          _swap(heap, _parentIndex, index);
          index = _parentIndex;
      }
    }
  }


  function _sinkDown(heap, index: number): void {
    let largest = _check(heap,
      rightIndex(index),
      _check(heap, leftIndex(index), index),
    );
    if (largest !== index) {
      _swap(heap, largest, index);
      _sinkDown(heap, largest);
    }
  }


  function _check(heap, index: number, largest: number): number {
    if (index < heap.length) {
      if (_comparator(heap, index, largest)) {
        return index;
      }
    }
    return largest;
  }


  function _swap(heap, a: number, b: number) {
    const A = heap[a];
    const B = heap[b];
    heap[a] = B;
    heap[b] = A;
  }


  function _comparator(heap, parentIndex: number, elementIndex: number): boolean {
    switch (true) {
      case parentIndex === elementIndex:
        throw new Error('parent index equals element index');
      case parentIndex < 0:
        throw new Error('parent index is less than zero');
      case parentIndex >= heap.length:
        throw new Error('parent index is greater than heap length');
      case elementIndex < 0:
        throw new Error('element index is less than zero');
      case elementIndex >= heap.length:
        throw new Error('element index is greater than heap length');
      case heap[parentIndex] == null:
        throw new Error('parent is undefined');
      case heap[elementIndex] == null:
        throw new Error('element is undefined');
    }
    return comparator(heap[parentIndex], heap[elementIndex]);
  }


}

export default heapFactory({
  NUM_CHILDREN: 2,
  comparator: (parent: HeapNode, element: HeapNode): boolean => parent.score > element.score,
  onDiff: (differences) => console.log(differences),
})
