'use server'
import { Octokit } from "@octokit/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFile } from "@/serverActions/fetch";

async function getRelevantFoldersFromAi(content: string[]){
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const instruction = 'as i am making a development project rater i am using u as an agent whose job is to just to output just an array of top 2 - 3 folders and files which you think would be good to look into recursively as you have context which will be good to view into to look into from the given folder structure, you dont have to write anything else just analyze and give me an object with key 1 as relevantFiles: string[] and key2 will be relevantFolders: string[] as simple as that you will get the content after the colon: '
    const result = await model.generateContent(instruction + content);
    const aiResponse = result.response;
    const insights = aiResponse.text();
    return insights

}

export async function getRepoStructure(owner: string, repo: string, path: string, token: string) {
  let result: string[] = []
  let count = 0
  const func = async (owner: string, repo: string, path: string, token: string) => {

    if(count > 5){
      return ''
    }
    
    count += 1
    
    try {
      const octokit = new Octokit({
        auth: token
      });

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: path || '',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  
    const content = Array.isArray(response.data) ? response.data : [response.data];

    const inputForAi = content.map((cont) => cont.name)

    const folders = await getRelevantFoldersFromAi(inputForAi)

    const cleaned = folders
    .replace("```json", "")
    .replace("```", "")
    .trim();

    const obj = JSON.parse(cleaned);



    for (const file of obj.relevantFiles) {
      result.push('File Name: ' + file + " " + await getFile(token, owner, repo, path + '/' + file) )  
    }


    for (const folder of obj.relevantFolders){
      console.log('path', path)
      await func(owner, repo, path + '/' + folder, token)
    }

    return content.map(item => ({
      name: item.name,
      type: item.type, 
      path: item.path,
    }));
  } catch(error) {
    console.error('Error in recursive function: ', error)
  } 
    }
  await func(owner, repo, path, token)

  return result.join('/n') 
}

  