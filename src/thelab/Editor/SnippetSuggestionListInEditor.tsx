import * as React from "React";
import { storageRef, dbRef } from "../../redux/configureStore";
import { SnippetEntityHoverDetails } from "./SnippetEntityHoverDetails";
import * as moment from "moment";
import { snippetSortFilter } from "./snippetSortFilter";

interface SnippetSuggestionProps {
  SnippetSuggestion: string;
  SnippetClicked: (Snippet: snippet) => void;
}

interface SnippetSuggestionState {
  snippets: snippet[];
  filteredSnippets: snippet[];
  isOpened: boolean;
  dbLoaded: boolean;
}

export class SnippetSuggestionListInEditor extends React.Component<
  SnippetSuggestionProps,
  SnippetSuggestionState
> {
  state = {
    filteredSnippets: Array<snippet>(),
    isOpened: false,
    snippets: [],
    dbLoaded: false
  };

  componentDidMount() {
    const sortFilterConfig = {
      searchTerms: this.props.SnippetSuggestion,
      sortByDate: true,
      recentDatesFirst: true,
      user: '',
      project: '',
    };
    dbRef.ref("snippets").on("child_added", snapshot => {
      let val = snapshot.val();
      storageRef.child(val.imgPath).getDownloadURL().then(url => {
        val.id = snapshot.key;
        val.downloadUrl = url;
        this.setState({ snippets: this.state.snippets.concat(val) });
        const snippets = snippetSortFilter(
          sortFilterConfig,
          this.state.snippets
        );
        this.setState({ filteredSnippets: snippets, isOpened: true });
      });
    });
  }

  componentWillReceiveProps(nextProp: SnippetSuggestionProps) {
    if (nextProp.SnippetSuggestion !== this.props.SnippetSuggestion) {
      const sortFilterConfig = {
        searchTerms: this.props.SnippetSuggestion,
        sortByDate: true,
        recentDatesFirst: true,
              user: '',
      project: '',
      };
      const snippets = snippetSortFilter(sortFilterConfig, this.state.snippets);
      console.log(snippets);
      this.setState({ filteredSnippets: snippets, isOpened: true });
    }
  }

  SnippetClicked = (Snippet: snippet) => {
    this.setState({ isOpened: false });
    this.props.SnippetClicked(Snippet); //pass up to container
  };

  render() {
    let { filteredSnippets } = this.state;
    return (
      <span>
        <span>{this.props.children}</span>
        {filteredSnippets.length > 0 &&
          this.state.isOpened &&
          <div className="filteredSnippets">
            <ul contentEditable={false}>
              {filteredSnippets.map(s =>
                <li onClick={() => this.SnippetClicked(s)} key={s.id}>
                  <SnippetEntityHoverDetails {...s} searchTerm={this.props.SnippetSuggestion} />
                </li>
              )}
            </ul>
          </div>}
      </span>
    );
  }
}
