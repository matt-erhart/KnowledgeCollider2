import * as React from 'React'
import { storageRef, dbRef } from "../../redux/configureStore";
import {Snippet} from './SnippetEntity'

interface SnippetSuggestionProps {
  SnippetSuggestion: string;
  SnippetClicked: (Snippet: snippet) => void;
}

interface SnippetSuggestionState {
  snippets: snippet[];
  SnippetItems: snippet[];
  isOpened: boolean;
}

export class SnippetSuggestion extends React.Component<
  SnippetSuggestionProps,
  SnippetSuggestionState
> {
  state = {
    SnippetItems: Array<snippet>(),
    isOpened: false,
    snippets: []
  };

  componentDidMount() {
    dbRef.ref("snippets").on("child_added", snapshot => {
      let val = snapshot.val();
      console.log(val)
      storageRef.child(val.imgPath).getDownloadURL().then(url => {
        val.id = snapshot.key;
        val.downloadUrl = url;
        this.setState({ snippets: this.state.snippets.concat(val) });
      });
    });

    this.GetSnippetSugestions(this.props.SnippetSuggestion);
  }

  componentWillReceiveProps(nextProp: SnippetSuggestionProps) {
    if (nextProp.SnippetSuggestion !== this.props.SnippetSuggestion) {
      this.GetSnippetSugestions(nextProp.SnippetSuggestion);
    }
  }

  async GetSnippetSugestions(sugestion: string) {
    const items = await filterSnippets(sugestion, this.state.snippets);
    if (items.length > 0) {
      this.state.isOpened = true;
    }
    this.setState({ SnippetItems: items });
  }

  SnippetClicked = (Snippet: snippet) => {
    this.setState({ isOpened: false });
    this.props.SnippetClicked(Snippet);
  };

  render() {
    let { SnippetItems } = this.state;
    return (
      <span>
        <span>{this.props.children}</span>
        {SnippetItems.length > 0 &&
          this.state.isOpened &&
          <div className="SnippetItems">
            <ul contentEditable={false}>
              {SnippetItems.map(s =>
                <li onClick={() => this.SnippetClicked(s)} key={s.id}>
                  <Snippet {...s} />
                </li>
              )}
            </ul>
          </div>}
      </span>
    );
  }
}

const filterSnippets = (text: string, snippets: snippet[]) => {
  return new Promise<snippet[]>(resolve => {
    setTimeout(() => {
      const items = snippets.filter(
        s => s.snippet.toLowerCase().indexOf(text.toLowerCase()) >= 0
      );
      resolve(items);
    }, 200);
  });
};