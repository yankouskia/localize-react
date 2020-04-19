import { useLocalize } from './use-localize';

export function Message({ defaultMessage, descriptor, values }) {
  const { translate } = useLocalize();
  return translate(descriptor, values, defaultMessage);
}
