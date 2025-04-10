import { Octokit } from "@octokit/core";

async function getRelevantFoldersFromAi(content: string[]){

}

export async function getRepoStructure(owner: string, repo: string, path = "", token: string) {
    const octokit = new Octokit({
        auth: token
    });
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  
    const content = Array.isArray(response.data) ? response.data : [response.data];

    const inputForAi = content.map((cont) => cont.name)

    await getRelevantFoldersFromAi(inputForAi)

  
    return content.map(item => ({
      name: item.name,
      type: item.type, 
      path: item.path,
    }));
}

  