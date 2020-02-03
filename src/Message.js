import { useLocalize } from './use-localize';

export function Message({ descriptor, values }) {
  const { translate } = useLocalize();

  return translate(descriptor, values);
}
