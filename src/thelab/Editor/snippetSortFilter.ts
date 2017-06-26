import * as moment from "moment";

interface SnippetSortFilter {
  searchTerms?: string; //space seperated
  sortByDate?: Boolean;
  recentDatesFirst?: Boolean;
}

export const snippetSortFilter = (
  sortFilter: SnippetSortFilter,
  snippets: snippet[]
): snippet[] => {
  const searchTermsArray = sortFilter.searchTerms.match(/\w+/g); //seperate by spaces
  if (searchTermsArray.length < 1) return [];
  const searchString = (str: string, search: string) => {
    return str.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  };

  let filteredSnippets = snippets.filter(snippet => {
    const matches = searchTermsArray.map(term => {
      const snippetMatch = searchString(snippet.snippet || "", term);
      const commentMatch = searchString(snippet.comment || "", term);
      const goalMatch = searchString(snippet.goal || "", term);
      const titleMatch = searchString(snippet.title || "", term);
      return snippetMatch || commentMatch || goalMatch || titleMatch;
    });
    return matches.some(x => x);
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
