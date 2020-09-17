import 'reflect-metadata'
import { Group, LEVELS } from './Group';

interface IConfig {
  type: any
  map ?: any
  index ?: any
}

function prop(config: IConfig) {
  return function(target, name) {
    const props = Reflect.getMetadata('ayo:props', target) || []
    Reflect.defineMetadata('ayo:props', props.concat(name), target)
    Reflect.defineMetadata('ayo:prop', config, target, name)
  }
}

function elastic(config: IConfig) {
  return function(target, name) {
    const props = Reflect.getMetadata('ayo:searches', target) || []
    Reflect.defineMetadata('ayo:searches', props.concat(name), target)
    Reflect.defineMetadata('ayo:search', config, target, name)
  }
}


export class Thing {

  @elastic({ type: 'string' })
  @prop({ type: String })
  name !: string


  @elastic({ type: 'number' })
  @prop({ type: Number })
  age !: number


  @elastic({ type: 'string' })
  @prop({ type: () => Group })
  groups ?: typeof Group


  createElasticSearchIndex() {
    return {
      name: this.name,
      age: this.age,
    }
  }

}

console.log('thingMeta.props', Reflect.getMetadata('ayo:props', Thing.prototype))
console.log('thingMeta.searches', Reflect.getMetadata('ayo:searches', Thing.prototype))

