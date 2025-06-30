interface Props {
  wishes: number;
}

export default function DjinnIllustration({ wishes }: Props) {
  let src = '/djinn-3.png';
  if (wishes === 2) src = '/djinn-2.png';
  else if (wishes === 1) src = '/djinn-1.png';
  else if (wishes <= 0) src = '/djinn-0.png';

  return (
    <img src={src} alt="djinn" className="w-32 h-32 mb-4" />
  );
}
