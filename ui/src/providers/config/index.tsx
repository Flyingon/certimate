import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from "react";

import { Access } from "@/domain/access";
import { AccessGroup } from "@/domain/access_groups";
import { EmailsSetting, Setting } from "@/domain/settings";
import { list } from "@/repository/access";
import { list as getAccessGroups } from "@/repository/access_group";
import { getEmails } from "@/repository/settings";
import { configReducer } from "./reducer";

export type ConfigData = {
  accesses: Access[];
  emails: Setting<EmailsSetting>;
  accessGroups: AccessGroup[];
};

export type ConfigContext = {
  config: ConfigData;
  setEmails: (email: Setting<EmailsSetting>) => void;
  addAccess: (access: Access) => void;
  updateAccess: (access: Access) => void;
  deleteAccess: (id: string) => void;
  setAccessGroups: (accessGroups: AccessGroup[]) => void;
  reloadAccessGroups: () => void;
};

const Context = createContext({} as ConfigContext);

export const useConfigContext = () => useContext(Context);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, dispatchConfig] = useReducer(configReducer, {
    accesses: [],
    emails: { content: { emails: [] } },
    accessGroups: [],
  });

  useEffect(() => {
    const featchData = async () => {
      const data = await list();
      dispatchConfig({ type: "SET_ACCESSES", payload: data });
    };
    featchData();
  }, []);

  useEffect(() => {
    const featchEmails = async () => {
      const emails = await getEmails();
      dispatchConfig({ type: "SET_EMAILS", payload: emails });
    };
    featchEmails();
  }, []);

  useEffect(() => {
    const featchAccessGroups = async () => {
      const accessGroups = await getAccessGroups();
      dispatchConfig({ type: "SET_ACCESS_GROUPS", payload: accessGroups });
    };
    featchAccessGroups();
  }, []);

  const reloadAccessGroups = useCallback(async () => {
    const accessGroups = await getAccessGroups();
    dispatchConfig({ type: "SET_ACCESS_GROUPS", payload: accessGroups });
  }, []);

  const setEmails = useCallback((emails: Setting<EmailsSetting>) => {
    dispatchConfig({ type: "SET_EMAILS", payload: emails });
  }, []);

  const deleteAccess = useCallback((id: string) => {
    dispatchConfig({ type: "DELETE_ACCESS", payload: id });
  }, []);

  const addAccess = useCallback((access: Access) => {
    dispatchConfig({ type: "ADD_ACCESS", payload: access });
  }, []);

  const updateAccess = useCallback((access: Access) => {
    dispatchConfig({ type: "UPDATE_ACCESS", payload: access });
  }, []);

  const setAccessGroups = useCallback((accessGroups: AccessGroup[]) => {
    dispatchConfig({ type: "SET_ACCESS_GROUPS", payload: accessGroups });
  }, []);

  return (
    <Context.Provider
      value={{
        config: {
          accesses: config.accesses,
          emails: config.emails,
          accessGroups: config.accessGroups,
        },
        setEmails,
        addAccess,
        updateAccess,
        deleteAccess,
        setAccessGroups,
        reloadAccessGroups,
      }}
    >
      {children && children}
    </Context.Provider>
  );
};
