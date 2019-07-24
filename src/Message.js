import { useLocalize } from './use-localize';

export function Message({ descriptor }) {
  const { translate } = useLocalize();

  return translate(descriptor);
}
