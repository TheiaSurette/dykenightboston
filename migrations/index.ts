import * as migration_20251126_173634_initial_schema from './20251126_173634_initial_schema';
import * as migration_20251201_195840 from './20251201_195840';
import * as migration_20251201_200108 from './20251201_200108';

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
    name: '20251201_200108'
  },
];
