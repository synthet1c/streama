import { HeapNode } from '../../utils/heap';

export interface IHeap<T extends IHeapable> {
  root: T
  size: number
  heap: T[]
  remove(item: T): T
  insert(item: T): T
}

export interface IHeapable {
  // [Symbol.toPrimitive]?(): number
  valueOf(): number
  id: number | string
  score: number
}

export type HeapLike = IHeapable[]

export interface IPosition {
  parent: Node
  left: Node
  right: Node
}

export class Node implements IHeapable {
  // the heap will never change once assigned
  // used for comparisons to positions in the tree - on change signal the Node to reconnect the stream
  current?: IPosition
  next?: IPosition

  id: number;
  public score: number = 1

  constructor({ id, score }) {
    this.id = id;
    this.score = score;
  }

  // get position in the heap
  /*
  position(): number {
    return 0
  }

  get parent(): Node {
    return this.heap.getParentNode(this)
  }

  get left(): Node {
    return this.heap.getLeftNode(this)
  }

  get right(): Node {
    return this.heap.getRightNode(this)
  }
 */
  [Symbol.toPrimitive](): number {
    return this.score
  }
  valueOf(): number {
    return this.score
  }
}

export default class Heap<T extends IHeapable> implements IHeap<T> {

  public constructor(
    public readonly NUM_CHILDREN = 2,
    private onDiff?: (differences) => void,
  ) {}

  public heap: T[] = []

  public get root(): T {
    return this.heap[0]
  }

  public get size() :number {
    return this.heap.length
  }

  public remove(node: T): T {
      const before = this.heap.slice()
      const index = this.indexOf(node)
      switch (true) {
        case index === -1:
          throw new Error(`Node not in heap`)
        case this.heap.length === 0:
          throw new Error(`heap is empty`)
        case index === this.heap.length - 1:
        case this.heap.length === 1 && index !== 0:
          const removed = this.heap.pop()
          this.diff(before, this.heap)
          return removed
        case index === 0:
          const result = this.extractRoot()
          this.diff(before, this.heap)
          return result
        default:
          this.heap[index] = this.heap.pop()
          this.sinkDown(index)
          this.diff(before, this.heap)
      }
  }

  private extractRoot(): T {
      if (!this.heap.length) {
        throw new Error(`heap is empty`)
      }
      const root = this.heap[0]
      if (this.heap.length > 1) {
        this.heap[0] = this.heap.pop()
        this.sinkDown(0)
        return root
      }
      this.heap.shift()
      return root
  }

  public insert(node: T): T {
    const before = this.heap.slice()
    this.heap.push(node)
    this.bubbleUp()
    this.diff(before, this.heap)
    return node
  }

  private diff(before: HeapLike, after: HeapLike) {
    const differences = [];
    // create a map to lookup nodes by id
    const beforeMap = before.reduce((acc, node: IHeapable, i: number) => ({
      ...acc,
      [node.id]: {
        id: node.id,
        score: node.score,
        left: before[Heap.leftIndex(i)],
        right: before[Heap.rightIndex(i)],
        parent: before[Heap.parentIndex(i)],
      },
    }), {});
    const afterMap = after.map((node: IHeapable, i: number) => ({
      id: node.id,
      score: node.score,
      left: after[Heap.leftIndex(i)],
      right: after[Heap.rightIndex(i)],
      parent: after[Heap.parentIndex(i)],
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
    if (typeof this.onDiff === 'function') {
      this.onDiff(differences)
    }
    return differences;
  }

  public getParentNode(node: T): T {
    const index = this.indexOf(node)
    const parentIndex = this.parent(index)
    return this.heap[parentIndex]
  }

  public getLeftNode(node: T): T {
    const index = this.indexOf(node)
    const leftIndex = this.leftChild(index)
    return this.heap[leftIndex]
  }

  public getRightNode(node: T): T {
    const index = this.indexOf(node)
    const rightIndex = this.rightChild(index)
    return this.heap[rightIndex]
  }

  static left = (heap, index) => heap[Heap.leftIndex(index)]
  static leftIndex = (index) => (index * 2) + 1
  static right = (heap, index) => heap[Heap.rightIndex(index)]
  static rightIndex = (index) => (index * 2) + 2
  static parent = (heap, index) => heap[Heap.parentIndex(index)]
  static parentIndex = (index) => Math.floor((index - 1) / 2)


  private leftChild(index: number): number {
    return index * this.NUM_CHILDREN + 1
  }

  private rightChild(index: number): number {
    return index * this.NUM_CHILDREN + 2
  }

  public parent(index: number): number {
    return Math.floor((index - 1) / this.NUM_CHILDREN)
  }


  private bubbleUp(index: number = this.heap.length - 1): void {
    while (index > 0) {
      const parentIndex = this.parent(index)
      switch (true) {
        case parentIndex >= this.heap.length:
        case this.heap[parentIndex] === this.heap[index]:
        case this._comparator(parentIndex, index):
          return
        default:
          this.swap(parentIndex, index)
          index = parentIndex
      }
    }
  }

  private sinkDown(index: number): void {
    let largest = this.check(
      this.rightChild(index),
      this.check(this.leftChild(index), index)
    )
    if (largest !== index) {
      this.swap(largest, index)
      this.sinkDown(largest)
    }
  }

  protected check(index: number, largest: number): number {
    if (index < this.heap.length) {
      if (this._comparator(index, largest)) {
        return index
      }
    }
    return largest
  }

  protected swap(a: number, b: number) {
    const A = this.heap[a]
    const B = this.heap[b]
    this.heap[a] = B
    this.heap[b] = A
  }

  protected comparator(parentIndex: number, elementIndex: number): boolean {
    return this.heap[parentIndex] > this.heap[elementIndex]
  }


  private _comparator(parentIndex: number, elementIndex: number): boolean {
    switch (true) {
      case parentIndex === elementIndex:
        throw new Error('parent index equals element index')
      case parentIndex < 0:
        throw new Error('parent index is less than zero')
      case parentIndex >= this.heap.length:
        throw new Error('parent index is greater than heap length')
      case elementIndex < 0:
        throw new Error('element index is less than zero')
      case elementIndex >= this.heap.length:
        throw new Error('element index is greater than heap length')
      case this.heap[parentIndex] == null:
        throw new Error('parent is undefined')
      case this.heap[elementIndex] == null:
        throw new Error('element is undefined')
    }
    return this.comparator(parentIndex, elementIndex)
  }


  public indexOf(item: T): number {
    return this.heap.indexOf(item)
  }

}

