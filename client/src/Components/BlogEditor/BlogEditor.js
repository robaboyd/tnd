import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './BlogEditor.css'
import Input from '../Input/Input.js'
import _ from "lodash"
import PBtn from '../PBtn/PBtn';
import api from '../../utils/api';
class BlogEditor extends Component {
  state = {
    editorState: EditorState.createEmpty(),
    editorHTML: {__html: '<div></div>'}, 
    titleInputVal: '',
    id: ''
  }

  componentDidMount = () => {
    let url = window.location.href.split('/');

    this.setState({
      id: url[5]
    })
    
    console.log(url)
    api.loadBlog(url[5]).then(blog => {
      console.log(blog.data)

      this.setState({
        titleInputVal: blog.data.title
      })

      const blocksFromHTML = htmlToDraft(blog.data.blog);
      const {contentBlocks, entityMap } = blocksFromHTML;
      const contentState= ContentState.createFromBlockArray(contentBlocks, entityMap);
      this.setState({
        editorState: EditorState.createWithContent(contentState),
        editorHTML: {__html: blog.data.blog}
      })
      
    })
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
      editorHTML: {__html: draftToHtml(convertToRaw(editorState.getCurrentContent()))}
    })
    //save on update
    //need to debounce to save when youre done typing
    //need to test w/ localStorage
  };

  save = () => {
    console.log('run save')
   // save to db 
   let data = {
     username: this.props.username,
     blog: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
     title: this.state.titleInputVal,
     id: this.state.id
   }
   api.saveBlog(data).then(res => {
     console.log(res)
   })
  }

  handleChange = event => {
    this.setState({
      titleInputVal: event.target.value
    })

  }
  render() {
    const { editorState } = this.state;
    return (
      <div>
      <div class="title">
        <Input className="title-box" placeholder="Title"onChange={this.handleChange} value={this.state.titleInputVal}/> 
        <PBtn onClick={this.save}>Save</PBtn>
      </div>
      <div className="editorWrapper">
        <Editor
          editorState={editorState}
          onEditorStateChange={this.onEditorStateChange}
        />
      </div>
      {/*Preview div*/}
      <div className="preview">
        <span dangerouslySetInnerHTML={this.state.editorHTML} />
      </div>
      </div>
    );
  }
}
export default BlogEditor;
