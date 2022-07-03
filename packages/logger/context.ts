import { Namespace, createNamespace } from 'cls-hooked';

let context: Namespace;

export const getContext = () => {
  if (!context) context = createNamespace('context');
  return context;
};

export const setContext = (data: any) => getContext().set('context', data);

export default context;
