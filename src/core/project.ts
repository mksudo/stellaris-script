export namespace Project {
  export interface Modules {}

  export type ProjectModuleKeys = keyof Modules;

  export type ProjectModule<Key> = Key extends ProjectModuleKeys
    ? Modules[Key]
    : never;

  export type ModuleEntries<Key> = Key extends ProjectModuleKeys
    ? keyof Modules[Key]
    : never;

  export type ModuleEntry<Key, EntryName> = Key extends ProjectModuleKeys
    ? EntryName extends ModuleEntries<Key>
      ? Modules[Key][EntryName]
      : never
    : never;

  export type IProject = {
    register: <Key extends ProjectModuleKeys>(
      key: Key,
      value: ProjectModule<Key>,
    ) => void;
    getModule: <Key extends ProjectModuleKeys>(
      key: Key,
    ) => ProjectModule<Key> | undefined;
  };

  export type IModule<Key extends ProjectModuleKeys> = {
    register: <EntryName extends ModuleEntries<Key>>(
      entryName: EntryName,
      value: ModuleEntry<Key, EntryName>,
    ) => void;
    getEntry: <EntryName extends ModuleEntries<Key>>(
      entryName: EntryName,
    ) => ModuleEntry<Key, EntryName> | undefined;
  };
}

const holder: Map<string, any> = new Map();

export const $project: Project.IProject = {
  register(key, value) {
    holder.set(key, value);
  },
  getModule(key) {
    return holder.get(key);
  },
};
