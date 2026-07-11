#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Landing Page AI Generator
 *
 * Generate landing page JSON configs from product info + template.
 *
 * Usage:
 *   npx tsx scripts/generate-landing.ts                          # Interactive mode
 *   npx tsx scripts/generate-landing.ts --template ai-saas \     # CLI mode
 *     --name "PhotoAI" \
 *     --description "AI photo editing" \
 *     --features "Background removal, Upscaling" \
 *     --target "Photographers"
 */
import * as p from '@clack/prompts';
import { config } from 'dotenv';

import { generateContent } from './ai-generate';
import { writePageConfigs } from './config-writer';
import { templates, getTemplate } from './templates';

// Load env
const envFiles = ['.env.development', '.env.local', '.env'];
for (const f of envFiles) {
  const envPath = resolve(process.cwd(), f);
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

interface CliArgs {
  template?: string;
  name?: string;
  description?: string;
  features?: string;
  target?: string;
  pricing?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2) as keyof CliArgs;
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      }
    }
  }
  return result;
}

async function interactive(): Promise<{
  templateKey: string;
  name: string;
  description: string;
  features: string;
  target: string;
  pricing?: string;
}> {
  p.intro('Landing Page AI Generator');

  const templateKey = (await p.select({
    message: 'Select a template type:',
    options: Object.entries(templates).map(([key, tpl]) => ({
      value: key,
      label: `${tpl.name} (${tpl.nameZh})`,
      hint: tpl.description,
    })),
  })) as string;

  if (p.isCancel(templateKey)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const name = (await p.text({
    message: 'Product name:',
    placeholder: 'e.g. PhotoAI',
    validate: (v) => (!v ? 'Required' : undefined),
  })) as string;
  if (p.isCancel(name)) process.exit(0);

  const description = (await p.text({
    message: 'One-line product description:',
    placeholder: 'e.g. AI-powered photo editing platform',
    validate: (v) => (!v ? 'Required' : undefined),
  })) as string;
  if (p.isCancel(description)) process.exit(0);

  const features = (await p.text({
    message: 'Core features (comma-separated):',
    placeholder: 'e.g. Background removal, Style transfer, Upscaling',
    validate: (v) => (!v ? 'Required' : undefined),
  })) as string;
  if (p.isCancel(features)) process.exit(0);

  const target = (await p.text({
    message: 'Target users:',
    placeholder: 'e.g. Photographers and designers',
    validate: (v) => (!v ? 'Required' : undefined),
  })) as string;
  if (p.isCancel(target)) process.exit(0);

  const pricing = (await p.text({
    message: 'Pricing info (optional, press Enter to skip):',
    placeholder: 'e.g. Free tier + $19/month Pro',
  })) as string;
  if (p.isCancel(pricing)) process.exit(0);

  return {
    templateKey,
    name,
    description,
    features,
    target,
    pricing: pricing || undefined,
  };
}

async function main() {
  const cliArgs = parseArgs();

  let templateKey: string;
  let name: string;
  let description: string;
  let features: string;
  let target: string;
  let pricing: string | undefined;

  if (cliArgs.template && cliArgs.name && cliArgs.description) {
    // CLI mode
    templateKey = cliArgs.template;
    name = cliArgs.name;
    description = cliArgs.description;
    features = cliArgs.features || '';
    target = cliArgs.target || '';
    pricing = cliArgs.pricing;
  } else {
    // Interactive mode
    const result = await interactive();
    templateKey = result.templateKey;
    name = result.name;
    description = result.description;
    features = result.features;
    target = result.target;
    pricing = result.pricing;
  }

  const template = getTemplate(templateKey);

  const spinner = p.spinner();
  spinner.start(
    `Generating landing for "${name}" via ${template.name} template`
  );

  try {
    const content = await generateContent(
      { name, description, features, target, pricing },
      template,
      (event) => {
        if (event.type === 'connecting') {
          spinner.message('Connecting to AI provider...');
        } else if (event.type === 'streaming') {
          spinner.message(`Streaming response: ${event.chars} chars received`);
        } else if (event.type === 'stream-done') {
          spinner.message(
            `Stream complete (${event.chars} chars) — parsing...`
          );
        } else if (event.type === 'parsing') {
          spinner.message('Parsing AI response as JSON...');
        }
      }
    );

    spinner.stop('AI content generated');

    const writeSpinner = p.spinner();
    writeSpinner.start('Writing locale page configs...');
    const { enPath, zhPath } = writePageConfigs(content, template, name);
    writeSpinner.stop('Wrote en/zh page configs + brand updates');

    p.note(
      [
        `English: ${enPath}`,
        `Chinese: ${zhPath}`,
        '',
        `Sections: ${template.sections.join(' → ')}`,
        '',
        'Run your dev server to preview the result.',
      ].join('\n'),
      'Generated files'
    );

    p.outro('Done! Your landing page config is ready.');
  } catch (error: any) {
    spinner.stop('Generation failed.');
    p.log.error(error.message);
    process.exit(1);
  }
}

main();
