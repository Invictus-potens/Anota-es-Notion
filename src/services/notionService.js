import { Client } from '@notionhq/client';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function createNotionPage({ title, content, user_id }) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      title: {
        title: [ { text: { content: title } } ]
      },
      content: {
        rich_text: [ { text: { content } } ]
      },
      user_id: {
        rich_text: [ { text: { content: String(user_id) } } ]
      }
    }
  });
  return response.id;
}

export async function updateNotionPage(pageId, { title, content }) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      title: {
        title: [ { text: { content: title } } ]
      },
      content: {
        rich_text: [ { text: { content } } ]
      }
    }
  });
}

export async function deleteNotionPage(pageId) {
  // Notion não permite deletar páginas via API, mas podemos arquivar
  await notion.pages.update({
    page_id: pageId,
    archived: true
  });
} 