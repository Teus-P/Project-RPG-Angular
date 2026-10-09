import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {TraitService} from './trait.service'

describeListFetcher({
  serviceName: 'TraitService',
  service: TraitService,
  endpoint: 'creatureTrait',
  sample: [{name: 'ARMOUR'}, {name: 'BITE'}],
  expectedLength: 2,
  emptiesListOnNull: true,
  fetch: service => service.fetchTraits(),
  list: service => service.traitList,
  changed: service => service.traitListChanged
})
