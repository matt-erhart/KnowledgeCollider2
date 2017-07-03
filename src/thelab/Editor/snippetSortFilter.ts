import * as moment from "moment";

export interface SnippetSortFilter {
  searchTerms?: string; //space seperated
  sortByDate?: Boolean;
  recentDatesFirst?: Boolean;
  user?: string;
  project?: string;
}

export const defaults: SnippetSortFilter = {
  searchTerms: "",
  sortByDate: true,
  recentDatesFirst: true
};

export const snippetSortFilter = (
  sortFilter: SnippetSortFilter = defaults,
  snippets: snippet[] = []
): snippet[] => {
  let searchTermsArray = sortFilter.searchTerms.match(/\w+/g); //seperate by spaces
  // if (!searchTermsArray) searchTermsArray = [];
  const searchString = (str: string, search: string) => {
    return str.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  };

  let filteredSnippets = snippets.filter(snippet => {
    const matches = searchTermsArray
      ? searchTermsArray.map(term => {
          if (term === "") return true;
          const snippetMatch = searchString(snippet.snippet || "", term);
          const commentMatch = searchString(snippet.comment || "", term);
          const titleMatch = searchString(snippet.title || "", term);
          return snippetMatch || commentMatch || titleMatch;
        })
      : [true];
    let match = matches.some(x => x);
    if (sortFilter.user.length > 0) {
      let user = snippet.user || "";
      match = match && (user.toLowerCase() === sortFilter.user.toLowerCase());
    }
    if (sortFilter.project.length > 0) {
      let project = snippet.project || "";
      match =
        match &&
        (project.toLowerCase() === sortFilter.project.toLowerCase());
    }
    return match;
  });

  if (sortFilter.sortByDate) {
    if (sortFilter.recentDatesFirst) {
      return filteredSnippets.sort(function(left, right) {
        return moment.utc(right.created).diff(moment.utc(left.created));
      });
    } else {
      return filteredSnippets.sort(function(left, right) {
        return moment.utc(left.created).diff(moment.utc(right.created));
      });
    }
  }

  return filteredSnippets;
};
