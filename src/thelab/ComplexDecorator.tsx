import * as React from "react";
import * as Draft from "draft-js";
import getSnippets, { snippet } from "./getSnippets";
require("!style-loader!css-loader!react-draft-wysiwyg/dist/react-draft-wysiwyg.css"); // eslint-disable-line import/no-unresolved
import { storageRef, dbRef } from "../redux/configureStore";

interface ComplexDecoratorState {
  editorState: Draft.EditorState;
  snippets: snippet[];
}

export class ComplexDecorator extends React.Component<
  null,
  ComplexDecoratorState
> {
  constructor(props: any) {
    super(props);

    const stockItemStratergy = (
      block: Draft.ContentBlock,
      callback: (start: number, end: number) => void
    ) => {
      block.findEntityRanges(
        val => {
          const entityKey = val.getEntity();
          if (!entityKey) {
            return false;
          }
          const contentState = this.state.editorState.getCurrentContent();
          return contentState.getEntity(entityKey).getType() === "stockItem";
        },
        (start, end) => callback(start, end)
      );

      const text = block.getText();
      let result: RegExpExecArray;
      let regex = /(^|\s)s:\w+/g;
      while ((result = regex.exec(text) as RegExpExecArray) != null) {
        let start = result.index;
        let end = start + result[0].length;
        callback(start, end);
      }
    };

    // tslint:disable-next-line:no-shadowed-variable
    const stockItemComponent = (props: {
      decoratedText: string;
      entityKey: string;
      children: any;
    }) => {
      if (props.entityKey) {
        var currentContent = this.state.editorState.getCurrentContent();
        const instance = currentContent.getEntity(props.entityKey);
        const data = instance.getData() as snippet;
        return (
          <EntityStock stockItem={data}>
            {props.children}
          </EntityStock>
        );
      }
      const stockName = props.decoratedText.replace("s:", "");
      return (
        <StockSuggestion
          stockSuggestion={stockName}
          stockClicked={this.stockItemClicked}
        >
          {props.children}
        </StockSuggestion>
      );
    };

    const compositeDecorator = new Draft.CompositeDecorator([
      {
        strategy: stockItemStratergy,
        component: stockItemComponent
      }
    ]);

    this.state = {
      editorState: Draft.EditorState.createEmpty(compositeDecorator),
      snippets: []
    };
  }

  stockItemClicked = (stockItem: snippet) => {
    const selectionState = this.state.editorState.getSelection();
    var anchorKey = selectionState.getAnchorKey();
    var currentContent = this.state.editorState.getCurrentContent();
    var currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const text = currentContentBlock.getText();
    const start = text.search("s:");
    const tmpStr = text.substring(start, text.length);
    let end = tmpStr.search("($| )");
    end = end + start;

    const partialSelection = selectionState.merge({
      anchorOffset: start,
      focusOffset: end
    }) as Draft.SelectionState;

    const contentStateWithEntity = currentContent.createEntity(
      "stockItem",
      "MUTABLE",
      stockItem
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContnentState = Draft.Modifier.replaceText(
      contentStateWithEntity,
      partialSelection,
      stockItem.comment,
      undefined,
      entityKey
    );
    const newEditorState = Draft.EditorState.push(
      this.state.editorState,
      newContnentState,
      "insert-characters"
    );
    const editorStateToUpdate = Draft.EditorState.forceSelection(
      newEditorState,
      newContnentState.getSelectionAfter()
    );

    this.setState({ editorState: editorStateToUpdate });
  };

  editorStateChanged = newEditorState =>
    this.setState({ editorState: newEditorState });

  componentDidMount() {
    (this.refs["editor"] as any).focus();
    getSnippets.take(1).subscribe(snippets => {
      this.setState({ snippets });
    });
    dbRef.ref("snippets").on("child_added", snapshot => {
      const newSnippet = snapshot.val();
      this.setState({ snippets: this.state.snippets.concat(newSnippet) });
    });
  }
  render() {
    return (
      <div
        className="editor"
        style={{ display: "flex", alignItems: "stretch" }}
      >
        <div
          style={{ flex: 1, minHeight: "100vh" }}
          onClick={e => {
            (this.refs["editor"] as any).focus();
          }}
        >
          <Draft.Editor
            style={{ flex: 1, minHeight: "100vh" }}
            placeHolder={":"}
            ref="editor"
            editorState={this.state.editorState}
            onChange={this.editorStateChanged}
          />
        </div>

        {/*<div style={{ flex: 1, backgroundColor: "silver", minHeight: "100vh" }}>
          <ul>
            {this.state.snippets &&
              this.state.snippets.map( (snippet,i) => {
                return <li key={i}>{snippet.snippet}</li>;
              })}

          </ul>
        </div>*/}
      </div>
    );
  }
}

interface StockSuggestionProps {
  stockSuggestion: string;
  stockClicked: (stock: snippet) => void;
}

interface StockSuggestionState {
  snippets: snippet[];
  stockItems: snippet[];
  isOpened: boolean;
}

export class StockSuggestion extends React.Component<
  StockSuggestionProps,
  StockSuggestionState
> {
  state = {
    stockItems: Array<snippet>(),
    isOpened: false,
    snippets: []
  };

  componentDidMount() {
    // getSnippets.take(1).subscribe(snippets => {
    //   console.log(snippets)
    //   this.setState({ snippets });
    // });

    dbRef.ref("snippets").on("child_added", snapshot => {
      let val = snapshot.val();
      console.log(val)
      storageRef.child(val.imgPath).getDownloadURL().then(url => {
        val.id = snapshot.key;
        val.downloadUrl = url;
        this.setState({ snippets: this.state.snippets.concat(val) });
      });
    });

    this.GetStockSugestions(this.props.stockSuggestion);
  }

  componentWillReceiveProps(nextProp: StockSuggestionProps) {
    if (nextProp.stockSuggestion !== this.props.stockSuggestion) {
      this.GetStockSugestions(nextProp.stockSuggestion);
    }
  }

  async GetStockSugestions(sugestion: string) {
    const items = await getStocksItemByName(sugestion, this.state.snippets);
    if (items.length > 0) {
      this.state.isOpened = true;
    }
    this.setState({ stockItems: items });
  }

  stockClicked = (stock: snippet) => {
    this.setState({ isOpened: false });
    this.props.stockClicked(stock);
  };

  render() {
    let { stockItems } = this.state;
    return (
      <span>
        <span>{this.props.children}</span>
        {stockItems.length > 0 &&
          this.state.isOpened &&
          <div className="stockItems">
            <ul contentEditable={false}>
              {stockItems.map(s =>
                <li onClick={() => this.stockClicked(s)} key={s.id}>
                  <StockItem {...s} />
                </li>
              )}
            </ul>
          </div>}
      </span>
    );
  }
}

const StockItem = (props: snippet) =>
  <div className="stockDetail">
    <div><strong>{props.comment}</strong></div>
    <div>Snippet: {props.snippet}</div>
    <img src={props.downloadUrl} width={500} height={500} />
  </div>;

class EntityStock extends React.Component<
  { stockItem: snippet },
  { hovering: boolean }
> {
  state = { hovering: false };
  render() {
    return (
      <span>
        <span
          className="stockItem"
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          {this.props.children}
        </span>
        {this.state.hovering &&
          <div className="stockItemHover">
            <StockItem {...this.props.stockItem} />
          </div>}
      </span>
    );
  }
}

const getStocksItemByName = (name: string, snippets: snippet[]) => {
  return new Promise<snippet[]>(resolve => {
    setTimeout(() => {
      const items = snippets.filter(
        s => s.snippet.toLowerCase().indexOf(name.toLowerCase()) >= 0
      );
      resolve(items);
    }, 200);
  });
};

// interface StockItemDef {
//   name: string;
//   description: string;
//   id: number;
//   stockQuantaty: number;
//   company: string;
//   SupplierContact: string;
// }
const stockItems = [
  {
    name: "salt",
    description: "condiment",
    id: 1234,
    stockQuantaty: 10,
    company: "Swan",
    SupplierContact: "040424553"
  },
  {
    name: "bread",
    description: "general",
    id: 1238,
    stockQuantaty: 9,
    company: "Lila",
    SupplierContact: "040424553"
  },
  {
    name: "Weet-Bix",
    description: "breakfast cereal",
    id: 1237,
    stockQuantaty: 8,
    company: "Sanitarium",
    SupplierContact: "040424553"
  },
  {
    name: "eggs",
    description: "breakfast",
    id: 1236,
    stockQuantaty: 7,
    company: "Ms Chicken",
    SupplierContact: "040424553"
  },
  {
    name: "Pie",
    description: "pastry",
    id: 1235,
    stockQuantaty: 6,
    company: "Get Phat",
    SupplierContact: "040424553"
  }
];
