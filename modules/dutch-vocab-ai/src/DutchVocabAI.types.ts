import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type DownloadProgressPayload = {
  bytesReceived: number;
  totalBytes: number;
  fraction: number;
};

export type SmallTalkChunkPayload = {
  text: string;
  done: boolean;
};

export type RoleplayChunkPayload = {
  text: string;
  done: boolean;
};

export type DutchVocabAIModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onDownloadProgress: (params: DownloadProgressPayload) => void;
  onSmallTalkChunk: (params: SmallTalkChunkPayload) => void;
  onRoleplayChunk: (params: RoleplayChunkPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type DutchVocabAIViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
