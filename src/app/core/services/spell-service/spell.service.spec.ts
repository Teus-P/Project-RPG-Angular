import {describeListFetcher} from '../../testing/list-fetcher-testing'
import {SpellService} from './spell.service'

describeListFetcher({
  serviceName: 'SpellService',
  service: SpellService,
  endpoint: 'spell',
  sample: [
    {name: 'FIREBALL', spellGroup: {name: 'FIRE'}},
    {name: 'FLAME_BLADE', spellGroup: {name: 'FIRE'}}
  ],
  expectedLength: 1,
  emptiesListOnNull: true,
  fetch: service => service.fetchSpells(),
  list: service => service.spellGroups,
  changed: service => service.spellGroupsChanged
})
