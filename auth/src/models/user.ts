import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    // setting how datamodel should be communicated
    // changing _id to id becuase otherdbs have id therefore easier to comm
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
/**
 we are using interface so that error gets displayed 
 if there is any typo while implementing users for ex: 

  new User({
    emil: 'test@test.com',  // its email, not emil
    password: 122444,       // this should be a string
    ewrrwe: wewewe          // there is no such thing defined in the schema
  });
TS doesnt show any error while we write this
and to solve this prblm we create an interface
 */

//an interface that describes the property
// necessary for creating a new User
interface UserAttrs {
  email: string;
  password: string;
}

//interface that describes properties of
// a user model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface that describes the properties
// a user document has i.e {_id: ..,__v:.. etc}
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// helps to embed functions into your schema
// https://mongoosejs.com/docs/2.7.x/docs/methods-statics.html
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
/**
 User.build({
   email: 'test@test.com',
   password: '1234'
 })
 the above code works (changes: 1. <any> 2.<any,UserModel>)
 */

export { User };

// const createUser = (attrs: UserAttrs) => {
//   return new User(attrs);
// }
// /**
//  * now when we write make errors like in prev example,
//     it immediately shows errors
//  */

// export {User, createUser};
