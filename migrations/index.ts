import * as migration_20251126_173634_initial_schema from './20251126_173634_initial_schema';
import * as migration_20251201_195840 from './20251201_195840';
import * as migration_20251201_200108 from './20251201_200108';
import * as migration_20251201_201632 from './20251201_201632';
import * as migration_20260301_add_events_status from './20260301_add_events_status';

export const migrations = [
  {
    up: migration_20251126_173634_initial_schema.up,
    down: migration_20251126_173634_initial_schema.down,
    name: '20251126_173634_initial_schema',
  },
  {
    up: migration_20251201_195840.up,
    down: migration_20251201_195840.down,
    name: '20251201_195840',
  },
  {
    up: migration_20251201_200108.up,
    down: migration_20251201_200108.down,
    name: '20251201_200108',
  },
  {
    up: migration_20251201_201632.up,
    down: migration_20251201_201632.down,
    name: '20251201_201632',
  },
  {
    up: migration_20260301_add_events_status.up,
    down: migration_20260301_add_events_status.down,
    name: '20260301_add_events_status',
  },
];
