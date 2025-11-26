import { getPayloadClient } from '@/lib/payload';
import { serializeRichText } from '@/lib/richText';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';

export const revalidate = 3600; // Revalidate every hour as fallback

export default async function AboutPage() {
  const payload = await getPayloadClient();

  const aboutData = await unstable_cache(
    async () =>
      payload.findGlobal({
        slug: 'about',
        depth: 1,
      }),
    ['about-page-data'],
    { tags: ['about-page'], revalidate: 3600 }
  )();

  const aboutSection = aboutData?.aboutSection;
  const houseRulesSection = aboutData?.houseRulesSection;
  const cruisingSection = aboutData?.cruisingSection;
  const flaggingSection = aboutData?.flaggingSection;

  // Serialize rich text content
  const aboutContent = aboutSection?.content ? await serializeRichText(aboutSection.content) : '';
  const cruisingContent = cruisingSection?.content
    ? await serializeRichText(cruisingSection.content)
    : '';
  const flaggingContent = flaggingSection?.content
    ? await serializeRichText(flaggingSection.content)
    : '';

  return (
    <main className="min-h-screen bg-transparent pt-16">
      <section className="py-8 px-6 pl-16 pr-16 md:pl-28 md:pr-28">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none flex flex-col gap-12">
            {/* About Section */}
            {aboutSection && (
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                  About <span className="text-red">Dyke Night</span>
                </h1>
                {aboutContent && (
                  <div
                    className="payload-richtext text-lg text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                    dangerouslySetInnerHTML={{ __html: aboutContent }}
                  />
                )}
              </div>
            )}

            {/* House Rules Section */}
            {houseRulesSection && houseRulesSection.rules && houseRulesSection.rules.length > 0 && (
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                  House <span className="text-red">Rules</span>
                </h1>
                <ol className="list-decimal list-inside text-lg mb-2 text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
                  {houseRulesSection.rules.map((rule: any, index: number) => (
                    <li
                      key={index}
                      className="text-lg text-white/90 mb-6 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                    >
                      {rule.rule}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Cruising Section */}
            {cruisingSection && (
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                  What is <span className="text-red">Cruising</span>?
                </h1>
                {cruisingContent && (
                  <div
                    className="payload-richtext text-lg text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                    dangerouslySetInnerHTML={{ __html: cruisingContent }}
                  />
                )}
              </div>
            )}

            {/* Flagging Section */}
            {flaggingSection && (
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                  What is <span className="text-red">Flagging</span>?
                </h1>
                {flaggingContent && (
                  <div
                    className="payload-richtext text-lg text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
                    dangerouslySetInnerHTML={{ __html: flaggingContent }}
                  />
                )}
                {flaggingSection.image && typeof flaggingSection.image === 'object' && (
                  <Image
                    src={flaggingSection.image.url || '/img/flagging.png'}
                    alt={flaggingSection.image.alt || 'flagging chart'}
                    width={500}
                    height={500}
                    className="w-full h-auto max-w-xl mx-auto mt-6"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
