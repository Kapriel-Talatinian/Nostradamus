import Head from 'next/head';
import AskNostradamus from '../components/AskNostradamus';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ask Nostradamus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AskNostradamus />
    </>
  );
}
