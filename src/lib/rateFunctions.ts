'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getRelevantFoldersFromAi(content: string[]){
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const instruction = 'as i am making a development project rater i am using u as an agent whose job is to just to output just an array of 1 or if you think its useful then only max 2 folders and files which you think would be good to look into recursively, make sure they should be less as the context cannot be very big to rate make sure to give less files and only the most relevant one avoid unnecessary files for example package.json can be relevant but config files are of no use similarly files having some code written in them components can be useful just be very picky as you have context which will be good to view into to look into from the given folder structure, you dont have to write anything else just analyze and give me an object with key 1 as relevantFiles: string[] and key2 will be relevantFolders: string[] as simple as that you will get the content after the colon: '
    const result = await model.generateContent(instruction + content);
    const aiResponse = result.response;
    const insights = aiResponse.text();
    return insights

}



export async function getPageSpeedScore(
  url: string,
) {
  if (!url) {
    return ''
  }
  // https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://web.dev/&key=
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${process.env.NEXT_PUBLIC_PAGE}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorData = await response.json();
    return `${errorData}`
  }

  const data = await response.json();

  const trimmed = {
    performanceScore: data.lighthouseResult?.categories?.performance?.score ?? 0,
    metrics: {
      fcp: data.lighthouseResult.audits['first-contentful-paint']?.displayValue || 'N/A',
      lcp: data.lighthouseResult.audits['largest-contentful-paint']?.displayValue || 'N/A',
      tti: data.lighthouseResult.audits['interactive']?.displayValue || 'N/A',
      cls: data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue || 'N/A',
    },
    url: data.lighthouseResult.requestedUrl,
    fetchTime: data.lighthouseResult.fetchTime,
    warnings: data.lighthouseResult.runWarnings || []
  };


  return JSON.stringify(trimmed, null, 2)
}

  