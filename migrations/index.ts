import * as migration_20251126_173634_initial_schema from './20251126_173634_initial_schema';

export const migrations = [
  {
    up: migration_20251126_173634_initial_schema.up,
    down: migration_20251126_173634_initial_schema.down,
    name: '20251126_173634_initial_schema'
  },
];
